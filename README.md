# Lambda Bot for Anime Notifier
- Update dynamodb from MAL anime data
- Compress MAL anime image and save to own s3 bucket

## AWS service used
- Lambda function
  - node.js 16.x
- System manager (SSM) parameter store
  - store token
  - free (not like secret manager)
- Dynamodb
  - store anime data
- Cloudwatch event
  - trigger lambda function every day

## Workflow
- malBot
  - get mal access token & refresh token from aws parameter store
  - refresh token from mal api
  - put mal access token & refresh token into aws parameter store
  - fetch mal latest season's anime
  - create new / update aws dynamodb's anime data
- imageBot
  - get anime picture url (mal hosted) from dynamodb
  - for 1 anime, download & compress the picture & convert to webp
  - upload to s3 bucket, update corresponding anime picture in dynamodb

## Deploy
- lambda
  - first time get mal access token & refresh token
    - set mal-auth in parameter store
  - create lambda function (node 16.x)
  - permission, policy, iam
    - dynamodb, ssm, log access
  - create env
    - e.g. mal client id, secret
  - upload .zip
  - increase timeout from 3sec to 30sec?
  - set cloudwatch event trigger lambda daily
- bucket
  - create bucket, cloudfront
  - cloudfront OAI, bucket policy, can only access bucket thru cloudfront
  - custom domain
    - aws certificate manager validate domain,
    - add domain to cloudfront, with ssl cert
    - change dns to point to cloudfront

## Troubleshoot
- for npm sharp package used for imageBot
  - local testing
    - npm install sharp
  - before zip and upload to aws
    - npm rebuild --arch=x64 --platform=linux --libc=glibc sharp
    - this will add additional >20MB to the package size
    - https://sharp.pixelplumbing.com/install#cross-platform
    - https://sharp.pixelplumbing.com/install#aws-lambda



