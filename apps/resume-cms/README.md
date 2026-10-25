# Resume CMS

Edit `src/content.ts` to change the resume. It exports a typed object containing the
name, contact details, summary, experience, skills, and education. The `satisfies ResumeInput` annotation provides autocomplete and
catches incorrect fields during type checking. Zod validates the content again before documents are generated.

`assets/resume-template.docx` controls the design, including Garamond fonts,
section rules, contact styling, and aligned dates and locations. It contains
reusable paragraph templates with `{{field}}` placeholders. Keep these placeholders
intact when changing its design. Edit wording in `src/content.ts`, because generated Word
files are overwritten on the next run.

The pipeline reads TypeScript content, fills the Word template, then converts that DOCX to PDF.
All outputs are written to `generated/` and ignored by Git:

- `robert-molina-resume.docx`: editable Word export.
- `robert-molina-resume.pdf`: PDF for sharing and Drive publishing.
- `page-1.png` and `page-2.png`: page previews for layout review.

## Editing and generation

From the repository root:

```sh
# Generate an editable Word file without LibreOffice or Poppler.
pnpm --filter @acme/resume-cms docx

# Generate Word, PDF, and page previews.
pnpm --filter @acme/resume-cms pdf

pnpm --filter @acme/resume-cms test
pnpm --filter @acme/resume-cms typecheck
```

Inside this app, use `pnpm docx`, `pnpm pdf`, `pnpm test`, or `pnpm publish:drive`.
The publish command requires Google Application Default Credentials and the file ID described below.
It uploads the most recently generated PDF, so run `pnpm pdf` first when publishing
locally. CI always generates the PDF before publishing it.

Each experience entry has `company`, `location`, `title`, `dates`, and a `bullets`
array. Entries render in array order. Add or remove entries and bullets as needed.
The optional `pageBreak` flag starts an entry on a new page. The current layout
starts Olympusat on page two. Keep metric qualifiers such as "approximately" and
"estimated" in their bullet text.

Skills use a `label` and an `items` string. Write plain text in the content strings.
Markdown syntax is not interpreted. Use regular TypeScript strings for prose.
Comments and multiline template strings are supported.

The Zod schema and inferred input/output types live in `src/schema.ts`.
Optional `pageBreak` values default to `false`. Missing fields, empty bullets,
and unknown keys fail validation with the relevant field path.

Inspect both page images before committing content or template edits. Checks
compare DOCX/PDF text in reading order, require two pages, and confirm Garamond
and Garamond Bold are present. These checks cannot detect every layout defect.
A deliberate page-count change also requires updating `src/verify.ts`.

## Local setup and CI

Run `pnpm install` from the repository root. The scripts run TypeScript directly
on Node 24 with native type stripping. Type checking is a separate command.
PDF conversion requires Docker to be installed and running. LibreOffice, Poppler,
and fallback fonts are installed inside `docker/Dockerfile`; you do not need them
on your host. DOCX generation, tests, and type checking require only Node and the
workspace dependencies.

`pnpm pdf` builds the `acme-resume-cms-pdf:local` tools image, generates the DOCX, and
runs conversion, PDF checks, and preview rendering in containers. Docker caches
the image after the first build. Content edits do not change the image. The first
build needs network access to download the base image and packages; conversion
containers run without network access.

Only the output directory is mounted into the containers. They run with your
user ID so the generated files remain editable on Linux. The source tree and
Google credentials are not mounted or passed to the conversion containers.

CI runs the same `pnpm pdf` path on a Docker-enabled Ubuntu runner. It builds
from the same Dockerfile instead of installing PDF tools on the runner itself.
The image follows the Docker engine's default CPU architecture, so inspect CI
previews as well as local previews when changing layout.

The Resume CMS workflow generates Word, PDF, and preview artifacts when resume files
or the workflow change on `main`. These pushes also replace the existing Drive PDF.
Manual runs publish only from `main`. The workflow does not run on pull requests
or commit generated files back to Git. The versioned sources are the TypeScript content, Zod schema, and DOCX template.

The template embeds the original Garamond fonts. Preview CI artifacts after font
or spacing changes. To refresh the image and its installed packages, run this
from the repository root:

```sh
docker build --pull --no-cache -t acme-resume-cms-pdf:local apps/resume-cms/docker
```

## One-time Google Drive setup

The publisher authenticates as a service account through GitHub Workload Identity
Federation. GitHub exchanges its identity for short-lived Google credentials.
No OAuth consent-screen publishing, policy pages, refresh tokens, or downloaded
service-account keys are required. The official `@googleapis/drive` SDK reads the
credentials through Application Default Credentials and requests the Drive scope.

The website embeds this existing PDF:
https://drive.google.com/file/d/15bEpE77LztNaNu2fn2wRtPsXeKzHSCu9/view

The publisher replaces that file's contents without creating a new file or changing
sharing permissions. Its Drive URL remains valid. A PDF uploaded directly to
LinkedIn is a separate copy and still needs its own update.

### 1. Create the service account and share the PDF

In the Google Cloud project with the Drive API enabled, open **IAM & Admin →
Service Accounts → Create service account**. Use **Resume CMS** as the display
name and `resume-cms` as the ID for a new account.
Skip project roles and optional user access. If you already created this service
account, keep it.

Open the existing PDF in Drive and share it with the service-account email as
**Editor**. Keep yourself as the owner. The account needs access to this existing
file, not project-wide Editor access or domain-wide delegation.

### 2. Connect GitHub to the service account

Open Google Cloud Shell in the `dotrmolinamir` project. If the service account
has a different ID, adjust `RESUME_SERVICE_ACCOUNT` below. The example uses
the existing `dotrmolinamir-resume-cms` account shown in GitHub.
Run these commands once. If a pool or provider with these IDs already exists,
inspect its configuration instead of creating a duplicate.

```sh
RESUME_PROJECT_ID='dotrmolinamir'
RESUME_SERVICE_ACCOUNT="dotrmolinamir-resume-cms@${RESUME_PROJECT_ID}.iam.gserviceaccount.com"
RESUME_PROJECT_NUMBER="$(gcloud projects describe "$RESUME_PROJECT_ID" --format='value(projectNumber)')"

gcloud services enable drive.googleapis.com iam.googleapis.com cloudresourcemanager.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project="$RESUME_PROJECT_ID"

gcloud iam workload-identity-pools create resume-cms \
  --project="$RESUME_PROJECT_ID" \
  --location=global \
  --display-name='Resume CMS GitHub Actions'

gcloud iam workload-identity-pools providers create-oidc resume-cms \
  --project="$RESUME_PROJECT_ID" \
  --location=global \
  --workload-identity-pool=resume-cms \
  --issuer-uri='https://token.actions.githubusercontent.com' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref' \
  --attribute-condition="assertion.repository_id == '156124858' && assertion.repository_owner_id == '40744756' && assertion.ref == 'refs/heads/main' && assertion.sub == 'repo:rmolinamir/dotrmolinamir:environment:resume-cms' && assertion.workflow_ref == 'rmolinamir/dotrmolinamir/.github/workflows/resume-cms.yml@refs/heads/main'"

gcloud iam service-accounts add-iam-policy-binding "$RESUME_SERVICE_ACCOUNT" \
  --project="$RESUME_PROJECT_ID" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${RESUME_PROJECT_NUMBER}/locations/global/workloadIdentityPools/resume-cms/attribute.repository_id/156124858"

gcloud iam workload-identity-pools providers describe resume-cms \
  --project="$RESUME_PROJECT_ID" \
  --location=global \
  --workload-identity-pool=resume-cms \
  --format='value(name)'
```

The provider condition restricts authentication to this repository's numeric ID,
its owner ID, the `main` branch, the `resume-cms` environment, and this workflow.
The final command prints the provider resource name for the next step. IAM changes
can take several minutes to propagate.

### 3. Configure GitHub

In repository **Settings → Environments**, create or open `resume-cms`.
Restrict deployment branches to `main`. Add these **environment variables**, not
secrets:

| Variable | Value |
| --- | --- |
| `GOOGLE_WORKLOAD_IDENTITY_PROVIDER` | The full provider name printed above: `projects/NUMBER/locations/global/workloadIdentityPools/resume-cms/providers/resume-cms` |
| `GOOGLE_SERVICE_ACCOUNT` | The existing service-account email, for example `dotrmolinamir-resume-cms@dotrmolinamir.iam.gserviceaccount.com` |
| `GOOGLE_DRIVE_FILE_ID` | Optional. Defaults to `15bEpE77LztNaNu2fn2wRtPsXeKzHSCu9`. Keep this ID to preserve existing links. |

No Google credential secrets are needed. The publish job alone has `id-token:
write`. It uses `google-github-actions/auth` after dependency installation and
artifact download, then runs the SDK with the temporary credentials. The auth
action removes its credentials file at job completion. The root `.gitignore`
excludes these temporary files too.

### 4. Run and check

Configure Google and GitHub before merging the resume workflow into `main`.
The merge triggers generation and publishing. If the workflow is already on
`main`, use **Actions → Update Resume CMS → Run workflow → main**.

Inspect the build artifact and confirm the updated PDF through the existing Drive
link. Both jobs must succeed. The publisher checks the target's MIME type and edit
permission, skips identical PDF bytes, and checks the returned file ID and MD5
checksum. It fails rather than creating a file with a different link.

Live federation and Drive access must be checked with a configured workflow run;
local unit tests do not establish that the cloud permissions are correct.

### Local publishing and troubleshooting

Local document generation does not need Google credentials. To publish locally,
use a federated Application Default Credentials configuration for the service
account, point `GOOGLE_APPLICATION_CREDENTIALS` to that configuration, and set
`GOOGLE_DRIVE_FILE_ID`. Run `pnpm pdf` before `pnpm publish:drive`. The GitHub
credential file is temporary and is not intended for reuse outside its job.

If federation fails, check the provider resource name, service-account binding,
repository IDs, branch, environment, and workflow path against the commands above.
If Drive access fails, confirm the API is enabled and the service-account email
has Editor access to the existing PDF. Do not create a new PDF to resolve an error.

References:
- [Google: create service-account credentials and share files](https://developers.google.com/workspace/guides/create-credentials)
- [Google: federation for deployment pipelines](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google GitHub authentication action](https://github.com/google-github-actions/auth)
- [Drive file uploads and updates](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
