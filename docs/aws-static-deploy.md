# MathDotConnect on AWS: command lab

This is a **static** deployment. CloudFront serves browser files from a private
S3 bucket. It does not run the Node server or its `/healthz` endpoint. Favorites
and contributions remain in each browser's local storage; this is not a shared
database deployment.

Run this in **AWS CloudShell** with a non-root identity. CloudShell includes an
authenticated AWS CLI. Do not put access keys in this repository. The existing
EC2 instance is not used or changed. Check the account's Free plan credits,
current EC2 charges, and a small cost alert in Billing before deploying.
Budget alerts can lag; they do not stop spending.

## 1. Inspect and prepare

```bash
aws sts get-caller-identity
aws configure get region
git clone --branch codex/aws-static-site-lab https://github.com/Kirat0201/MathDotConnect.git
cd MathDotConnect
npm run build:static
find dist -type f | sort
```

- `get-caller-identity` shows the account and identity that will make changes.
  If its ARN ends in `:root`, switch to a non-root login first.
- The branch option selects the AWS lab branch while its pull request is under
  review. Once merged, clone the default branch instead.
- `git clone` downloads the project; `npm run build:static` copies exactly
  eight public files. Inspect `dist/` before uploading. No `.env`, Git data,
  test files, video, or server code should appear.

## 2. Create the infrastructure

Choose a Region available to the account. The example uses Mumbai:

```bash
export AWS_REGION=ap-south-1
aws cloudformation validate-template --region "$AWS_REGION" --template-body file://infra/static-site.yaml
aws cloudformation deploy --region "$AWS_REGION" --stack-name mathdotconnect-demo --template-file infra/static-site.yaml
aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name mathdotconnect-demo --query 'Stacks[0].Outputs' --output table
```

- `validate-template` checks CloudFormation syntax without creating resources.
- `deploy` creates a private, encrypted S3 bucket and an HTTPS CloudFront
  distribution. Origin access control signs CloudFront's requests to S3. The
  bucket policy allows reads only from this distribution.
- `describe-stacks` gives the bucket name, distribution ID, and public URL.
  It does not show that the site has been uploaded yet.

## 3. Upload and check

Copy the three output values into these variables:

```bash
BUCKET='paste-BucketName'
DIST_ID='paste-DistributionId'
SITE_URL='paste-SiteURL'
aws s3 sync dist/ "s3://$BUCKET/" --delete --region "$AWS_REGION"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*'
curl -I "$SITE_URL/"
curl -I "https://$BUCKET.s3.$AWS_REGION.amazonaws.com/index.html"
aws s3api get-public-access-block --bucket "$BUCKET" --region "$AWS_REGION"
aws s3 ls "s3://$BUCKET/" --recursive --region "$AWS_REGION"
```

- `s3 sync` uploads changed files; `--delete` removes files from **this
  dedicated demo bucket** that are absent from `dist/`. Do not aim it at a
  shared bucket.
- `create-invalidation` tells CloudFront to refresh cached paths. It may
  take time to finish.
- The CloudFront URL should return 200 over HTTPS and include content security,
  frame, MIME sniffing, and referrer headers. The direct S3 URL should return 403. The bucket listing should contain exactly the eight packaged files.

Open the site in a browser. Search an equation, save a favorite, refresh, and
check that the favorite remains in **that browser**.

## 4. Recovery drill

Record the deployed commit with `git rev-parse --short HEAD`. To practise a
rollback, first save a copy of the known-good `dist/` somewhere outside the
bucket. Make a harmless visible change in a separate working copy, rebuild and
sync it, then restore the known-good `dist/`, sync again, and invalidate.
Check the old text is visible. The CloudFormation stack stays in place.

If no live deployment happened, say so. A truthful interview line after this
lab passes is: “I packaged a static project, deployed private S3 and CloudFront
with CloudFormation, uploaded the assets with the AWS CLI, checked HTTPS and
bucket isolation, and practised a rollback.” Name any step you did not complete.

## Interview map

- **CloudFormation:** declares the resources; `deploy` reconciles the stack.
- **S3:** stores objects; the bucket is not public.
- **CloudFront:** serves the public HTTPS URL and caches responses.
- **Origin access control:** signs CloudFront-to-S3 requests.
- **IAM:** controls who may run the deployment commands.
- **Shared responsibility:** AWS runs the platform; you control the files,
  permissions, headers, deployment process, and spending.

CloudFront's default domain provides HTTPS without buying a custom domain.
This demo does not include a server, database, WAF, custom DNS, or an uptime
guarantee. Those are separate design decisions.
