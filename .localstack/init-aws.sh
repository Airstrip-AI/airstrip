#!/usr/bin/env bash

set -euo pipefail

awslocal s3 mb s3://airstrip
awslocal s3api put-bucket-cors --bucket airstrip --cors-configuration file:///etc/localstack/init/ready.d/cors-config.json
