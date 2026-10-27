# Practical cloud labs using MathDotConnect

Each lab should produce a working artifact and a short explanation. No provider or paid account is required for the local labs. The goal is to understand and operate your own software.

## 1. Follow a request

Run `npm start`. Inspect `curl -i http://127.0.0.1:4173/healthz` and the browser Network panel. Explain the process, listening address, port, HTTP status, MIME type, and request for each module. Use `lsof -nP -iTCP:4173 -sTCP:LISTEN` on macOS or `ss -ltnp` on Linux to find the listener. Stop the process and observe a connection failure.

Evidence: a diagram from browser to server, captured response headers, and an explanation of why `127.0.0.1` differs from `0.0.0.0`.

## 2. Containerize

Read the [Docker introduction](https://docs.docker.com/get-started/). Build the included Dockerfile and run it with a loopback-bound port. Inspect logs, stop/restart the container, and inspect its health status. Explain image vs container, port mapping, non-root execution, and why the app has no persistent server volume.

Evidence: successful health check, explanation of each Dockerfile instruction, and the exact image identifier used. The instructions are not evidence that this lab has run.

## 3. Stage a deployment

Choose a provider and verify its current costs before creating resources. Deploy the reviewed commit. Configure a staging URL and TLS. Keep any platform credentials in the platform secret manager. Explain DNS resolution, TLS termination, and how traffic reaches the container.

For the current browser-only release, follow the [AWS static site command lab](aws-static-deploy.md). It serves files through S3 and CloudFront; the container exercise above remains a separate runtime lab.

Evidence: staging URL, commit/image identifier, deployment steps, resource inventory, and budget alert. Do not create billable infrastructure without an agreed budget.

## 4. Deliver changes and recover

Run checks on a branch, review the diff, and deploy a tested version to staging. Introduce a harmless visible change, then roll back to the previous image. Explain which component performs deployment and why a passing health check alone does not prove that every user flow works.

Evidence: CI run, release identifier, rollback command, and the observed old behavior after rollback.

## 5. Add data only when the backend exists

For shared publishing, create a least-privilege database role, apply schema migrations, back up data, and restore into a separate test database. Never practice restore by overwriting the sole copy of production data. Explain the difference between app code rollback and database migration recovery.

Evidence: migration history and a verified restore. This lab depends on Sprint 2 and is not part of the local-storage release.

## 6. Diagnose an incident

Simulate a stopped process or incorrect port in staging. Detect it using health checks and logs, identify the cause, recover, and write a brief incident note. Track actual detection and recovery times rather than inventing reliability metrics.

Evidence: symptom, investigation, root cause, recovery, and one preventative improvement.
