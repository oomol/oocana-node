module.exports = {
  branchPrefix: "renovate/",
  gitAuthor: "OOMOL Bot <122335590+oomol-bot@users.noreply.github.com>",
  platform: "github",
  ignorePrAuthor: true,
  gitIgnoredAuthors: ["122335590+oomol-bot@users.noreply.github.com"],
  dependencyDashboardTitle: "Action Dependency Dashboard",
  repositories: ["oomol/oocana-node"],
  packageRules: [
    {
      description: "lockFileMaintenance",
      matchUpdateTypes: [
        "pin",
        "digest",
        "patch",
        "minor",
        "major",
        "lockFileMaintenance",
      ],
      dependencyDashboardApproval: false,
      minimumReleaseAge: "0",
    },
  ],
  force: {
    schedule: null,
  },
  requireConfig: "ignored",
  inheritConfig: true,
  inheritConfigRepoName: "oomol/oocana-node",
  inheritConfigFileName: ".github/renovate-action-config.json",
};
