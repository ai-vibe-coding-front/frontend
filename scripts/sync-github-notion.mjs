import fs from "node:fs";

const {
  NOTION_TOKEN,
  NOTION_ISSUES_DATA_SOURCE_ID,
  NOTION_GITHUB_ASSIGNEE_MAP = "{}",
  NOTION_VERSION = "2025-09-03",
  GITHUB_EVENT_NAME,
  GITHUB_ACTION_NAME,
  GITHUB_REPOSITORY,
  GITHUB_EVENT_PATH,
} = process.env;

const ALLOWED_LABELS = new Set([
  "blocked",
  "chore",
  "docs",
  "feature",
  "fix",
  "question",
  "refactor",
  "style",
]);

const METADATA_ONLY_ISSUE_ACTIONS = new Set([
  "labeled",
  "unlabeled",
  "assigned",
  "unassigned",
]);

const githubAssigneeToNotionName = parseAssigneeMap(NOTION_GITHUB_ASSIGNEE_MAP);
let notionUsersCache = null;

if (!NOTION_TOKEN) fail("Missing NOTION_TOKEN secret.");
if (!NOTION_ISSUES_DATA_SOURCE_ID) fail("Missing NOTION_ISSUES_DATA_SOURCE_ID secret.");
if (!GITHUB_EVENT_PATH) fail("Missing GITHUB_EVENT_PATH.");

const payload = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, "utf8"));
const notionBaseUrl = "https://api.notion.com/v1";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  if (GITHUB_EVENT_NAME === "issues") {
    await syncIssue(payload.issue, GITHUB_ACTION_NAME);
    return;
  }

  if (GITHUB_EVENT_NAME === "pull_request") {
    await syncPullRequest(payload.pull_request, GITHUB_ACTION_NAME);
    return;
  }

  console.log(`Unsupported event: ${GITHUB_EVENT_NAME}`);
}

async function syncIssue(issue, action) {
  if (!issue) fail("Issue payload is missing.");

  const issueNumber = issue.number;
  const existingPage = await findNotionIssuePage({ issueNumber });
  const shouldUpdateStatus = !existingPage || !isMetadataOnlyIssueAction(action);

  const properties = {
    "Issue": title(issue.title),
    "Issue ID": richText(`#${issueNumber}`),
    "GitHub Issue Number": number(issueNumber),
    "GitHub Link": url(issue.html_url),
    "GitHub Repo": richText(GITHUB_REPOSITORY),
    "GitHub State": richText(issue.state),
    "GitHub Event": select(`issue_${action}`),
    "GitHub Synced At": dateNow(),
    "GitHub Labels": multiSelect(mapGitHubLabels(issue)),
    "Type": select(mapIssueType(issue)),
  };

  const ownerProperty = await mapIssueAssigneesToOwner(issue);
  if (ownerProperty) {
    properties["Owner"] = ownerProperty;
  }

  if (shouldUpdateStatus) {
    properties["Kanban Status"] = select(mapIssueToKanban(action, issue));
    properties["Status"] = status(mapIssueToStatus(action, issue));
  }

  if (existingPage) {
    await updatePage(existingPage.id, properties);
    console.log(`Updated Notion page for issue #${issueNumber}`);
    return;
  }

  await createPage(
    {
      ...properties,
      "Priority": select("Medium"),
    },
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
  const linkedIssueNumbers = extractLinkedIssueNumbers([
    pr.title,
    pr.body ?? "",
    pr.head?.ref ?? "",
  ].join("\n"));

  const eventName = mapPullRequestEvent(action, pr);
  const kanbanStatus = mapPullRequestToKanban(action, pr);
  const taskStatus = mapPullRequestToStatus(action, pr);

  if (linkedIssueNumbers.length > 0) {
    for (const issueNumber of linkedIssueNumbers) {
      const existingPage = await findNotionIssuePage({ issueNumber });

      const properties = {
        "GitHub PR Number": number(prNumber),
        "PR Link": url(pr.html_url),
        "GitHub Repo": richText(GITHUB_REPOSITORY),
        "GitHub State": richText(pr.merged ? "merged" : pr.state),
        "GitHub Event": select(eventName),
        "GitHub Synced At": dateNow(),
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
            "GitHub Repo": richText(GITHUB_REPOSITORY),
            "GitHub State": richText(pr.merged ? "merged" : pr.state),
            "GitHub Event": select(eventName),
            "GitHub Synced At": dateNow(),
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
    "GitHub Repo": richText(GITHUB_REPOSITORY),
    "GitHub State": richText(pr.merged ? "merged" : pr.state),
    "GitHub Event": select(eventName),
    "GitHub Synced At": dateNow(),
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

function mapGitHubLabels(issue) {
  const labels = (issue.labels ?? [])
    .map((label) => String(label.name ?? "").trim())
    .filter(Boolean);

  return labels.filter((label) => ALLOWED_LABELS.has(label));
}

function mapIssueType(issue) {
  const typeName = issue.type?.name ?? issue.issue_type?.name ?? "";
  const normalizedType = String(typeName).toLowerCase();

  if (normalizedType === "bug") return "Bug";
  if (normalizedType === "feature") return "Feature";
  if (normalizedType === "task") return "Task";

  const labels = (issue.labels ?? []).map((label) => String(label.name ?? "").toLowerCase());
  if (labels.includes("fix")) return "Bug";
  if (labels.includes("feature")) return "Feature";

  return "Task";
}

async function mapIssueAssigneesToOwner(issue) {
  const assignees = issue.assignees ?? [];
  if (assignees.length === 0) return people([]);
  if (githubAssigneeToNotionName.size === 0) return null;

  try {
    const notionUsers = await fetchNotionUsers();
    const notionUserIds = [];

    for (const assignee of assignees) {
      const login = String(assignee.login ?? "").toLowerCase();
      const notionName = githubAssigneeToNotionName.get(login);

      if (!notionName) {
        console.warn(`Missing Notion owner mapping for GitHub assignee: ${login}. Skipping Owner sync.`);
        return null;
      }

      const notionUserId = findNotionUserIdByName(notionUsers, notionName);

      if (!notionUserId) {
        console.warn(`No Notion user matched mapped assignee name: ${notionName}. Skipping Owner sync.`);
        return null;
      }

      notionUserIds.push(notionUserId);
    }

    return people(notionUserIds);
  } catch (error) {
    console.warn("Failed to map GitHub assignees to Notion Owner. Skipping Owner sync.");
    console.warn(error);
    return null;
  }
}

async function fetchNotionUsers() {
  if (notionUsersCache) return notionUsersCache;

  const users = [];
  let startCursor = null;

  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (startCursor) query.set("start_cursor", startCursor);

    const response = await notionRequest("GET", `/users?${query.toString()}`);
    const results = response.json.results ?? [];
    users.push(...results);
    startCursor = response.json.has_more ? response.json.next_cursor : null;
  } while (startCursor);

  notionUsersCache = users;
  return users;
}

function findNotionUserIdByName(users, name) {
  const targetName = normalizeName(name);
  const user = users.find((candidate) => normalizeName(candidate.name) === targetName);
  return user?.id ?? null;
}

function parseAssigneeMap(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || "{}");
    return new Map(
      Object.entries(parsed).map(([githubLogin, notionName]) => [
        String(githubLogin).toLowerCase(),
        String(notionName),
      ]),
    );
  } catch (error) {
    console.warn("Invalid NOTION_GITHUB_ASSIGNEE_MAP. Owner sync will be skipped.");
    console.warn(error);
    return new Map();
  }
}

function normalizeName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isMetadataOnlyIssueAction(action) {
  return METADATA_ONLY_ISSUE_ACTIONS.has(action);
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
  if (results.length > 1) {
    console.warn(`Found ${results.length} Notion rows for GitHub issue #${issueNumber}. Updating the first one only.`);
  }

  return results[0] ?? null;
}

async function findNotionPrPage({ prNumber }) {
  const response = await queryDataSource({
    filter: { property: "GitHub PR Number", number: { equals: prNumber } },
    page_size: 10,
  });

  const results = response.results ?? [];
  if (results.length > 1) {
    console.warn(`Found ${results.length} Notion rows for GitHub PR #${prNumber}. Updating the first one only.`);
  }

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
  const bodyForDataSource = {
    parent: { data_source_id: NOTION_ISSUES_DATA_SOURCE_ID },
    properties,
    children,
  };

  const first = await notionRequest("POST", "/pages", bodyForDataSource, { allowFailure: true });
  if (first.ok) return first.json;

  const bodyForDatabase = {
    parent: { database_id: NOTION_ISSUES_DATA_SOURCE_ID },
    properties,
    children,
  };

  const second = await notionRequest("POST", "/pages", bodyForDatabase, { allowFailure: true });
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

function mapIssueToKanban(action, issue) {
  const labels = (issue.labels ?? []).map((label) => String(label.name ?? "").toLowerCase());

  if (labels.includes("blocked")) return "Blocked";
  if (action === "closed" || issue.state === "closed") return "Done";
  if (action === "reopened") return "To Do";
  if (action === "opened") return "To Do";
  return "In Progress";
}

function mapIssueToStatus(action, issue) {
  if (action === "closed" || issue.state === "closed") return "완료";
  if (action === "opened" || action === "reopened") return "시작 전";
  return "진행 중";
}

function mapPullRequestEvent(action, pr) {
  if (action === "closed" && pr.merged) return "pr_merged";
  if (action === "closed") return "pr_closed";
  if (action === "synchronize") return "pr_sync";
  if (action === "ready_for_review") return "pr_ready_for_review";
  return `pr_${action}`;
}

function mapPullRequestToKanban(action, pr) {
  if (action === "closed" && pr.merged) return "Done";
  if (action === "closed") return "To Do";
  if (action === "converted_to_draft") return "In Progress";
  return "In Review";
}

function mapPullRequestToStatus(action, pr) {
  if (action === "closed" && pr.merged) return "완료";
  if (action === "closed") return "진행 중";
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

function dateNow() {
  return { date: { start: new Date().toISOString() } };
}

function paragraph(content) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }],
    },
  };
}

function heading2(content) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }],
    },
  };
}

function bulletedListItem(content) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: String(content).slice(0, 2000) } }],
    },
  };
}

function trim(text, maxLength) {
  const value = String(text ?? "");
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
