import fs from "node:fs";

const {
  NOTION_TOKEN,
  NOTION_ISSUES_DATA_SOURCE_ID,
  NOTION_GITHUB_ASSIGNEE_MAP = "{}",
  NOTION_VERSION = "2025-09-03",
  GITHUB_TOKEN,
  GITHUB_API_URL = "https://api.github.com",
  GITHUB_API_VERSION = "2026-03-10",
  GITHUB_DATE_FIELD_MAP = '{"Start":"Start","Start Date":"Start","시작일":"Start","시작 예정일":"Start","Target":"Due Date","Target Date":"Due Date","Due Date":"Due Date","마감일":"Due Date","목표일":"Due Date","완료 목표일":"Due Date"}',
  GITHUB_FIELD_MAP = '{"Priority":"Priority","우선순위":"Priority","Effort":"Estimate","Estimate":"Estimate","작업량":"Estimate","난이도":"Estimate","Domain":"Domain","담당 영역":"Domain","영역":"Domain"}',
  GITHUB_ISSUE_FIELD_ID_MAP = '{"42791012":"Priority","42791013":"Due Date","42791014":"Start","42791015":"Estimate"}',
  GITHUB_SYNC_WINDOW_DAYS = "9999",
  GITHUB_EVENT_NAME,
  GITHUB_ACTION_NAME,
  GITHUB_REPOSITORY,
  GITHUB_EVENT_PATH,
} = process.env;

const ALLOWED_LABELS = new Set(["blocked", "chore", "docs", "feature", "fix", "question", "refactor", "style"]);
const STATUS_CHANGING_ISSUE_ACTIONS = new Set(["opened", "closed", "reopened"]);
const NOTION_USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const githubAssigneeToNotionUserId = parseAssigneeMap(NOTION_GITHUB_ASSIGNEE_MAP);
const githubDateFieldToNotionProperty = parseNameMap(GITHUB_DATE_FIELD_MAP);
const githubFieldToNotionProperty = parseNameMap(GITHUB_FIELD_MAP);
const githubIssueFieldIdToNotionProperty = parseNameMap(GITHUB_ISSUE_FIELD_ID_MAP);
const notionBaseUrl = "https://api.notion.com/v1";

if (!NOTION_TOKEN) fail("Missing NOTION_TOKEN secret.");
if (!NOTION_ISSUES_DATA_SOURCE_ID) fail("Missing NOTION_ISSUES_DATA_SOURCE_ID secret.");
if (!GITHUB_EVENT_PATH) fail("Missing GITHUB_EVENT_PATH.");

const payload = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, "utf8"));

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (GITHUB_EVENT_NAME === "issues") return syncIssue(payload.issue, GITHUB_ACTION_NAME);
  if (GITHUB_EVENT_NAME === "pull_request") return syncPullRequest(payload.pull_request, GITHUB_ACTION_NAME);
  if (GITHUB_EVENT_NAME === "schedule" || GITHUB_EVENT_NAME === "workflow_dispatch") return syncRecentIssues();
  console.log(`Unsupported event: ${GITHUB_EVENT_NAME}`);
}

async function syncRecentIssues() {
  const issues = await listRecentlyUpdatedIssues();
  console.log(`Syncing ${issues.length} GitHub issues.`);
  for (const issue of issues) await syncIssue(issue, "scheduled");
}

async function syncIssue(issue, action) {
  if (!issue) fail("Issue payload is missing.");

  const issueNumber = issue.number;
  const existingPage = await findNotionIssuePage({ issueNumber });
  const issueFieldProperties = await mapIssueFieldsToNotionProperties(issue);

  const properties = {
    "Issue": title(issue.title),
    "Issue ID": richText(`#${issueNumber}`),
    "GitHub Issue Number": number(issueNumber),
    "GitHub Link": url(issue.html_url),
    "GitHub Labels": multiSelect(mapGitHubLabels(issue)),
    "Type": select(mapIssueType(issue)),
    ...issueFieldProperties,
  };

  const ownerProperty = mapIssueAssigneesToOwner(issue);
  if (ownerProperty) properties["Owner"] = ownerProperty;

  if (shouldUpdateIssueStatus(action, existingPage)) {
    properties["Kanban Status"] = select(mapIssueToKanban(action, issue));
    properties["Status"] = status(mapIssueToStatus(action, issue));
  }

  if (existingPage) {
    await updatePage(existingPage.id, properties);
    console.log(`Updated Notion page for issue #${issueNumber}`);
    return;
  }

  await createPage(
    { ...properties, "Priority": properties["Priority"] ?? select("Medium") },
    [
      heading2("GitHub Issue 원문"),
      paragraph(`Issue: #${issueNumber}`),
      paragraph(issue.html_url),
      paragraph(issue.body ? trim(issue.body, 1900) : "No GitHub issue body."),
      heading2("Notion에서 보완할 항목"),
      bulletedListItem("Sprint"),
      bulletedListItem("Domain"),
      bulletedListItem("Owner"),
      bulletedListItem("Done Criteria"),
    ],
  );

  console.log(`Created Notion page for issue #${issueNumber}`);
}

async function syncPullRequest(pr, action) {
  if (!pr) fail("Pull request payload is missing.");

  const prNumber = pr.number;
  const linkedIssueNumbers = extractLinkedIssueNumbers([pr.title, pr.body ?? "", pr.head?.ref ?? ""].join("\n"));
  const kanbanStatus = mapPullRequestToKanban(action, pr);
  const taskStatus = mapPullRequestToStatus(action, pr);

  if (linkedIssueNumbers.length > 0) {
    for (const issueNumber of linkedIssueNumbers) {
      const existingPage = await findNotionIssuePage({ issueNumber });
      const properties = {
        "GitHub PR Number": number(prNumber),
        "PR Link": url(pr.html_url),
        "Kanban Status": select(kanbanStatus),
        "Status": status(taskStatus),
      };

      if (existingPage) {
        await updatePage(existingPage.id, properties);
        console.log(`Updated Notion issue #${issueNumber} from PR #${prNumber}`);
      } else {
        await createPage(
          {
            "Issue": title(`[GitHub 연결 필요] Issue #${issueNumber}`),
            "Issue ID": richText(`#${issueNumber}`),
            "GitHub Issue Number": number(issueNumber),
            "GitHub PR Number": number(prNumber),
            "PR Link": url(pr.html_url),
            "Kanban Status": select(kanbanStatus),
            "Status": status(taskStatus),
            "Type": select("Task"),
            "Priority": select("Medium"),
          },
          [
            paragraph(`PR #${prNumber}에서 참조된 Issue #${issueNumber}입니다.`),
            paragraph(pr.html_url),
            paragraph("Notion에서 Sprint, Domain, Owner, Done Criteria를 보완하세요."),
          ],
        );
        console.log(`Created placeholder Notion issue #${issueNumber} from PR #${prNumber}`);
      }
    }
    return;
  }

  const existingPrPage = await findNotionPrPage({ prNumber });
  const properties = {
    "Issue": title(`[PR] ${pr.title}`),
    "GitHub PR Number": number(prNumber),
    "PR Link": url(pr.html_url),
    "Kanban Status": select(kanbanStatus),
    "Status": status(taskStatus),
    "Type": select("Task"),
    "Priority": select("Medium"),
  };

  if (existingPrPage) {
    await updatePage(existingPrPage.id, properties);
    console.log(`Updated standalone PR row #${prNumber}`);
  } else {
    await createPage(properties, [
      paragraph(`Linked GitHub PR: #${prNumber}`),
      paragraph(pr.html_url),
      paragraph("연결된 GitHub Issue 번호를 찾지 못해 PR 추적용 항목으로 생성했습니다."),
      paragraph("PR 본문에 Closes #이슈번호를 추가하면 기존 이슈와 연결됩니다."),
    ]);
    console.log(`Created standalone PR row #${prNumber}`);
  }
}

async function listRecentlyUpdatedIssues() {
  const syncWindowDays = Number.parseInt(GITHUB_SYNC_WINDOW_DAYS, 10);
  const days = Number.isFinite(syncWindowDays) && syncWindowDays > 0 ? syncWindowDays : 9999;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [owner, repo] = String(GITHUB_REPOSITORY ?? "").split("/");
  if (!owner || !repo) return [];

  const response = await githubRequest(
    "GET",
    `/repos/${owner}/${repo}/issues?state=all&since=${encodeURIComponent(since)}&per_page=100&sort=updated&direction=desc`,
  );
  const issues = Array.isArray(response.json) ? response.json : [];
  return issues.filter((issue) => !issue.pull_request);
}

function mapGitHubLabels(issue) {
  return (issue.labels ?? [])
    .map((label) => String(label.name ?? "").trim())
    .filter((label) => label && ALLOWED_LABELS.has(label));
}

function mapIssueType(issue) {
  const typeName = issue.type?.name ?? issue.issue_type?.name ?? "";
  const normalizedType = normalizeName(typeName);
  if (normalizedType === "bug") return "Bug";
  if (normalizedType === "feature") return "Feature";
  if (normalizedType === "task") return "Task";

  const labels = (issue.labels ?? []).map((label) => normalizeName(label.name));
  if (labels.includes("fix")) return "Bug";
  if (labels.includes("feature")) return "Feature";
  return "Task";
}

function mapIssueAssigneesToOwner(issue) {
  const assignees = issue.assignees ?? [];
  if (assignees.length === 0) return people([]);
  if (githubAssigneeToNotionUserId.size === 0) return null;

  const notionUserIds = [];
  for (const assignee of assignees) {
    const login = normalizeName(assignee.login);
    const notionUserId = githubAssigneeToNotionUserId.get(login);
    if (!notionUserId) {
      console.warn(`Missing Notion owner user id for GitHub assignee: ${login}. Skipping Owner sync.`);
      return null;
    }
    notionUserIds.push(notionUserId);
  }
  return people(notionUserIds);
}

async function mapIssueFieldsToNotionProperties(issue) {
  const properties = mapIssueBodyDatesToNotionProperties(issue?.body ?? "");
  const issueFields = await getGitHubIssueFields(issue);

  for (const field of issueFields) {
    const value = normalizeIssueFieldValue(field);
    const notionPropertyName = resolveNotionPropertyForIssueField(field, value);
    logIssueFieldMapping(field, value, notionPropertyName);
    if (!notionPropertyName) continue;

    const notionProperty = mapIssueFieldValueToNotionProperty(notionPropertyName, value);
    if (notionProperty) properties[notionPropertyName] = notionProperty;
  }

  return properties;
}

function mapIssueBodyDatesToNotionProperties(body) {
  const startDate = extractDateFromIssueBody(body, ["Start", "Start Date", "시작일", "시작 예정일"]);
  const dueDate = extractDateFromIssueBody(body, ["Target", "Target Date", "Due Date", "마감일", "목표일", "완료 목표일"]);
  const properties = {};
  if (startDate) properties["Start"] = dateValue(startDate);
  if (dueDate) properties["Due Date"] = dateValue(dueDate);
  return properties;
}

function resolveNotionPropertyForIssueField(field, value) {
  const fieldName = normalizeName(field.name ?? field.field_name ?? field.field?.name ?? field.issue_field?.name);
  const fieldId = String(field.issue_field_id ?? field.field_id ?? field.id ?? "").trim();
  const nodeId = String(field.node_id ?? "").trim();

  const mappedByFieldId = githubIssueFieldIdToNotionProperty.get(fieldId) ?? githubIssueFieldIdToNotionProperty.get(nodeId);
  if (mappedByFieldId) return mappedByFieldId;

  const mappedDateByName = githubDateFieldToNotionProperty.get(fieldName);
  if (mappedDateByName) return mappedDateByName;

  const mappedByName = githubFieldToNotionProperty.get(fieldName);
  if (mappedByName) return mappedByName;

  const dataType = normalizeName(field.data_type ?? field.type);
  const rawText = normalizeName([fieldName, nodeId, value].filter(Boolean).join(" "));

  if (dataType === "date") {
    if (rawText.includes("start") || rawText.includes("시작")) return "Start";
    if (rawText.includes("target") || rawText.includes("due") || rawText.includes("deadline") || rawText.includes("마감") || rawText.includes("목표")) return "Due Date";
    return null;
  }

  if (dataType === "number") return "Estimate";
  if (normalizeDomain(value)) return "Domain";
  if (normalizePriority(value)) return "Priority";
  return null;
}

function mapIssueFieldValueToNotionProperty(propertyName, value) {
  if (value == null || value === "") return null;

  if (propertyName === "Start" || propertyName === "Due Date") {
    const dateText = normalizeDateString(value);
    return dateText ? dateValue(dateText) : null;
  }

  if (propertyName === "Priority") return select(normalizePriority(value));

  if (propertyName === "Estimate") {
    const estimate = normalizeEstimate(value);
    return estimate ? select(estimate) : null;
  }

  if (propertyName === "Domain") {
    const domain = normalizeDomain(value);
    return domain ? select(domain) : null;
  }

  return richText(value);
}

function normalizePriority(value) {
  const normalized = normalizeName(value);
  if (!normalized) return null;
  if (["p0", "p1", "critical", "urgent", "high", "긴급", "높음"].includes(normalized)) return "High";
  if (["p2", "medium", "mid", "normal", "중간", "보통"].includes(normalized)) return "Medium";
  if (["p3", "p4", "low", "lowest", "낮음"].includes(normalized)) return "Low";
  return null;
}

function normalizeEstimate(value) {
  const normalized = normalizeName(value);
  if (!normalized) return null;

  if (["low", "낮음", "xs", "s", "small", "1", "2"].includes(normalized)) return "Low";
  if (["medium", "mid", "normal", "중간", "보통", "m", "3"].includes(normalized)) return "Medium";
  if (["high", "높음", "l", "xl", "large", "5", "8"].includes(normalized)) return "High";

  return null;
}

function normalizeDomain(value) {
  const normalized = normalizeName(value);
  if (!normalized) return null;

  const domainMap = new Map([
    ["common", "공통"], ["shared", "공통"], ["공통", "공통"],
    ["planning", "기획"], ["plan", "기획"], ["prd", "기획"], ["기획", "기획"],
    ["auth", "인증"], ["authentication", "인증"], ["login", "인증"], ["인증", "인증"],
    ["frontend", "프론트엔드"], ["front-end", "프론트엔드"], ["front", "프론트엔드"], ["fe", "프론트엔드"], ["프론트", "프론트엔드"], ["프론트엔드", "프론트엔드"],
    ["backend", "백엔드"], ["back-end", "백엔드"], ["back", "백엔드"], ["be", "백엔드"], ["백엔드", "백엔드"],
    ["db", "DB"], ["database", "DB"], ["데이터베이스", "DB"],
    ["api", "API"],
    ["deploy", "배포"], ["deployment", "배포"], ["devops", "배포"], ["infra", "배포"], ["배포", "배포"],
    ["qa", "QA"], ["test", "QA"], ["testing", "QA"], ["테스트", "QA"],
    ["docs", "문서"], ["document", "문서"], ["documentation", "문서"], ["문서", "문서"],
  ]);

  return domainMap.get(normalized) ?? null;
}

function extractDateFromIssueBody(body, labels) {
  const escapedLabels = labels.map((label) => escapeRegExp(label)).join("|");
  const patterns = [
    new RegExp(`(?:^|\\n)\\s*[-*]?\\s*(?:${escapedLabels})\\s*[:：]\\s*(\\d{4}-\\d{2}-\\d{2})`, "i"),
    new RegExp(`(?:^|\\n)\\s*[-*]?\\s*\\*\\*(?:${escapedLabels})\\*\\*\\s*[:：]\\s*(\\d{4}-\\d{2}-\\d{2})`, "i"),
    new RegExp('(?:^|\\n)\\s*[-*]?\\s*`(?:' + escapedLabels + ')`\\s*[:：]\\s*(\\d{4}-\\d{2}-\\d{2})', "i"),
  ];

  for (const pattern of patterns) {
    const match = String(body ?? "").match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function getGitHubIssueFields(issue) {
  const fromPayload = collectIssueFieldsFromPayload(issue);
  if (fromPayload.length > 0) return fromPayload;

  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN is missing. Skipping GitHub issue field sync.");
    return [];
  }

  const [owner, repo] = String(GITHUB_REPOSITORY ?? "").split("/");
  if (!owner || !repo || !issue?.number) return [];

  const candidates = [
    `/repos/${owner}/${repo}/issues/${issue.number}/issue-field-values?per_page=100`,
    `/repos/${owner}/${repo}/issues/${issue.number}/fields?per_page=100`,
    `/repos/${owner}/${repo}/issues/${issue.number}/issue-fields?per_page=100`,
  ];

  for (const path of candidates) {
    const response = await githubRequest("GET", path, { allowFailure: true });
    if (!response.ok) {
      console.warn(`GitHub issue field request failed for #${issue.number}: ${path} ${response.status}`);
      continue;
    }

    const fields = normalizeIssueFieldsResponse(response.json);
    if (fields.length > 0) return fields;
  }

  console.warn(`No GitHub issue fields found for issue #${issue.number}.`);
  return [];
}

function collectIssueFieldsFromPayload(issue) {
  const candidates = [
    issue?.fields,
    issue?.issue_fields,
    issue?.field_values,
    issue?.issue_field_values,
    issue?.issue_field_values?.nodes,
    payload?.fields,
    payload?.issue_fields,
    payload?.field_values,
    payload?.issue_field_values,
    payload?.issue_field_values?.nodes,
  ];
  return candidates.flatMap((candidate) => normalizeIssueFieldsResponse(candidate));
}

function normalizeIssueFieldsResponse(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.fields)) return json.fields;
  if (Array.isArray(json.issue_fields)) return json.issue_fields;
  if (Array.isArray(json.values)) return json.values;
  if (Array.isArray(json.nodes)) return json.nodes;
  if (Array.isArray(json.field_values)) return json.field_values;
  if (Array.isArray(json.issue_field_values)) return json.issue_field_values;
  if (Array.isArray(json.issue_field_values?.nodes)) return json.issue_field_values.nodes;
  return [];
}

function normalizeIssueFieldValue(field) {
  const raw =
    field.single_select_option?.name ??
    field.option?.name ??
    field.single_select?.name ??
    field.value ??
    field.date ??
    field.text ??
    field.number ??
    field.field_value?.value;

  if (raw && typeof raw === "object") return raw.start ?? raw.value ?? raw.date ?? raw.name ?? raw.text ?? raw.number ?? null;
  return raw;
}

function logIssueFieldMapping(field, value, notionPropertyName) {
  console.log(
    `Issue field mapping: ${JSON.stringify({
      issue_field_id: field.issue_field_id ?? field.field_id ?? field.id ?? null,
      node_id: field.node_id ?? null,
      name: field.name ?? field.field_name ?? field.field?.name ?? field.issue_field?.name ?? null,
      data_type: field.data_type ?? field.type ?? null,
      value,
      notion_property: notionPropertyName ?? null,
    })}`,
  );
}

function normalizeDateString(value) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function parseAssigneeMap(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || "{}");
    const entries = [];
    for (const [githubLogin, notionUserId] of Object.entries(parsed)) {
      const normalizedGitHubLogin = normalizeName(githubLogin);
      const normalizedNotionUserId = String(notionUserId ?? "").trim();
      if (!normalizedGitHubLogin || !normalizedNotionUserId) continue;
      if (!NOTION_USER_ID_PATTERN.test(normalizedNotionUserId)) {
        console.warn(`Skipping invalid Notion user id for GitHub assignee: ${normalizedGitHubLogin}.`);
        continue;
      }
      entries.push([normalizedGitHubLogin, normalizedNotionUserId]);
    }
    return new Map(entries);
  } catch (error) {
    console.warn("Invalid NOTION_GITHUB_ASSIGNEE_MAP. Owner sync will be skipped.");
    console.warn(error);
    return new Map();
  }
}

function parseNameMap(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || "{}");
    return new Map(
      Object.entries(parsed)
        .map(([key, value]) => [String(key ?? "").trim().toLowerCase(), String(value ?? "").trim()])
        .filter(([key, value]) => key && value),
    );
  } catch (error) {
    console.warn("Invalid field map. Field sync will be skipped.");
    console.warn(error);
    return new Map();
  }
}

function normalizeName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shouldUpdateIssueStatus(action, existingPage) {
  return !existingPage || STATUS_CHANGING_ISSUE_ACTIONS.has(action);
}

function extractLinkedIssueNumbers(text) {
  const patterns = [
    /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi,
    /(?:issue|notion issue id|notion issue|관련 이슈|연결 이슈)\s*[:#]?\s*#?(\d+)/gi,
  ];
  const numbers = new Set();
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const raw = Number(match[1]);
      if (Number.isInteger(raw) && raw > 0) numbers.add(raw);
    }
  }
  return [...numbers];
}

async function findNotionIssuePage({ issueNumber }) {
  const response = await queryDataSource({
    filter: { property: "GitHub Issue Number", number: { equals: issueNumber } },
    page_size: 10,
  });
  const results = response.results ?? [];
  if (results.length > 1) console.warn(`Found ${results.length} Notion rows for GitHub issue #${issueNumber}. Updating the first one only.`);
  return results[0] ?? null;
}

async function findNotionPrPage({ prNumber }) {
  const response = await queryDataSource({
    filter: { property: "GitHub PR Number", number: { equals: prNumber } },
    page_size: 10,
  });
  const results = response.results ?? [];
  if (results.length > 1) console.warn(`Found ${results.length} Notion rows for GitHub PR #${prNumber}. Updating the first one only.`);
  return results[0] ?? null;
}

async function queryDataSource(body) {
  const dataSourcePath = `/data_sources/${NOTION_ISSUES_DATA_SOURCE_ID}/query`;
  const databaseFallbackPath = `/databases/${NOTION_ISSUES_DATA_SOURCE_ID}/query`;
  const first = await notionRequest("POST", dataSourcePath, body, { allowFailure: true });
  if (first.ok) return first.json;
  const second = await notionRequest("POST", databaseFallbackPath, body, { allowFailure: true });
  if (second.ok) return second.json;
  throw new Error(`Failed to query Notion source. data_sources=${first.status}, databases=${second.status}`);
}

async function createPage(properties, children = []) {
  const first = await notionRequest("POST", "/pages", { parent: { data_source_id: NOTION_ISSUES_DATA_SOURCE_ID }, properties, children }, { allowFailure: true });
  if (first.ok) return first.json;
  const second = await notionRequest("POST", "/pages", { parent: { database_id: NOTION_ISSUES_DATA_SOURCE_ID }, properties, children }, { allowFailure: true });
  if (second.ok) return second.json;
  throw new Error(`Failed to create Notion page. data_source_parent=${first.status}, database_parent=${second.status}`);
}

async function updatePage(pageId, properties) {
  const response = await notionRequest("PATCH", `/pages/${pageId}`, { properties });
  return response.json;
}

async function notionRequest(method, path, body, options = {}) {
  const response = await fetch(`${notionBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok && !options.allowFailure) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error(`Notion API request failed: ${method} ${path} ${response.status}`);
  }
  return { ok: response.ok, status: response.status, json };
}

async function githubRequest(method, path, options = {}) {
  const response = await fetch(`${GITHUB_API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok && !options.allowFailure) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error(`GitHub API request failed: ${method} ${path} ${response.status}`);
  }
  return { ok: response.ok, status: response.status, json };
}

function mapIssueToKanban(action, issue) {
  const labels = (issue.labels ?? []).map((label) => normalizeName(label.name));
  if (labels.includes("blocked")) return "Blocked";
  if (action === "closed" || issue.state === "closed") return "Done";
  if (action === "reopened") return "To Do";
  return "To Do";
}

function mapIssueToStatus(action, issue) {
  if (action === "closed" || issue.state === "closed") return "완료";
  if (action === "opened" || action === "reopened") return "시작 전";
  return "시작 전";
}

function mapPullRequestToKanban(action, pr) {
  if (action === "closed" && pr.merged) return "Done";
  if (action === "closed") return "To Do";
  if (action === "converted_to_draft") return "In Progress";
  return "In Review";
}

function mapPullRequestToStatus(action, pr) {
  if (action === "closed" && pr.merged) return "완료";
  return "진행 중";
}

function title(content) {
  return { title: [{ text: { content: String(content).slice(0, 2000) } }] };
}

function richText(content) {
  return { rich_text: [{ text: { content: String(content ?? "").slice(0, 2000) } }] };
}

function number(value) {
  return { number: value == null ? null : Number(value) };
}

function url(value) {
  return { url: value ?? null };
}

function select(name) {
  return { select: name ? { name } : null };
}

function multiSelect(names) {
  return { multi_select: [...new Set(names)].map((name) => ({ name })) };
}

function status(name) {
  return { status: name ? { name } : null };
}

function people(ids) {
  return { people: [...new Set(ids)].map((id) => ({ id })) };
}

function dateValue(start) {
  return { date: { start } };
}

function paragraph(content) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }] } };
}

function heading2(content) {
  return { object: "block", type: "heading_2", heading_2: { rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }] } };
}

function bulletedListItem(content) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }] } };
}

function trim(text, maxLength) {
  const value = String(text ?? "");
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
