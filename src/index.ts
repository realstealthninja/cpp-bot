import { Context, Probot } from "probot";
import { CheckDocumentation, DocumentationError } from "./parser.js";

export default (app: Probot) => {
  // on pull request opened
  app.on("pull_request.opened", async (context: Context) => {
    await context.octokit.issues.addLabels(
      context.issue({ labels: ["awaiting review"] })
    );

    await context.octokit.issues.createComment(
      context.issue({
        body: "Thank you for your contributions.\
               While you wait for your pull request to be reviewed check out \
               [contribution guidelines](https://github.com/TheAlgorithms/C-Plus-Plus/blob/0ecb6bd28a8a6b5ffc0edcad34ac036647d2259f/CONTRIBUTING.md)",
      })
    );

    var comments = [];

    // get read all the files
    const files = (
      await context.octokit.pulls.listFiles({
        owner: context.repo().owner,
        repo: context.repo().repo,
        pull_number: context.pullRequest().pull_number,
      })
    ).data;

    for (const file of files) {
      if (!file.filename.endsWith(".cpp")) {
        continue;
      }
      let file_contents: string = "";

      await (await fetch(file.blob_url).then((r) => r.blob()))
        .text()
        .then((value: string) => (file_contents = value));

      let errors: DocumentationError[] = CheckDocumentation(
        file_contents.split("\n")
      );

      if (errors.length > 0) {
        await context.octokit.issues.addLabels(
          context.issue({ labels: ["Proper Documentation Required"] })
        );
      }

      for (const error of errors) {
        comments.push({
          path: file.filename,
          line: error.line + 1,
          body: error.what,
        });
      }
    }
    if (comments.length > 0) {
      await context.octokit.pulls.createReview({
        owner: context.repo().owner,
        repo: context.repo().repo,
        pull_number: context.pullRequest().pull_number,
        comments: comments,
        event: "REQUEST_CHANGES",
      });
    }
  });

  app.on("pull_request_review.submitted", async (context) => {
    const pr = (await context.octokit.pulls.get(context.pullRequest())).data;

    const awaiting_review = (
      await context.octokit.issues.getLabel({
        owner: context.repo().owner,
        repo: context.repo().repo,
        name: "awaiting review",
      })
    ).data;

    const review = await context.payload.review;

    if (
      review.state == "changes_requested" &&
      pr.labels.some((label) => label.id === awaiting_review.id)
    ) {
      await context.octokit.issues.addLabels(
        context.issue({ labels: ["awaiting modification"] })
      );

      await context.octokit.issues.removeLabel(
        context.issue({ name: "awaiting review" })
      );
      await context.octokit.issues.removeLabel(
        context.issue({ name: "approved" })
      );
    }

    if (review.state == "approved") {
      await context.octokit.issues.setLabels(
        context.issue({ labels: ["approved"] })
      );
    }
  });

  app.on("pull_request_review.dismissed", async (context) => {
    const pr = (await context.octokit.pulls.get(context.pullRequest())).data;

    const awaiting_modification = (
      await context.octokit.issues.getLabel({
        owner: context.repo().owner,
        repo: context.repo().repo,
        name: "awaiting modification",
      })
    ).data;

    if (pr.labels.some((label) => label.id === awaiting_modification.id)) {
      await context.octokit.issues.addLabels(
        context.issue({ labels: ["awaiting review"] })
      );

      await context.octokit.issues.removeLabel(
        context.issue({ name: "awaiting modification" })
      );
    }
  });
};
