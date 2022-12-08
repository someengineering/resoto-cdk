import * as iam from "aws-cdk-lib/aws-iam";

/**
 * This is the list of permissions required for Resoto to collect resources.
 *
 * To get the latest list of permissions, run the following command in the resoto repo in plugins/aws:
 * > pytest test/collector_test.py::test_all_called_apis -s
 */
export const collect = iam.PolicyStatement.fromJson({
    "Sid": "ResotoCollectPermission",
    "Effect": "Allow",
    "Action": [
        "apigateway:GET",
        "athena:GetDataCatalog",
        "athena:GetWorkGroup",
        "athena:ListDataCatalogs",
        "athena:ListTagsForResource",
        "athena:ListWorkGroups",
        "autoscaling:DescribeAutoScalingGroups",
        "cloudformation:DescribeStacks",
        "cloudformation:ListStackInstances",
        "cloudformation:ListStackSets",
        "cloudwatch:DescribeAlarms",
        "cognito-idp:ListGroups",
        "cognito-idp:ListTagsForResource",
        "cognito-idp:ListUserPools",
        "cognito-idp:ListUsers",
        "dynamodb:DescribeGlobalTable",
        "dynamodb:DescribeTable",
        "dynamodb:ListGlobalTables",
        "dynamodb:ListTables",
        "dynamodb:ListTagsOfResource",
        "ec2:DescribeAddresses",
        "ec2:DescribeHosts",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeInstances",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeKeyPairs",
        "ec2:DescribeNatGateways",
        "ec2:DescribeNetworkAcls",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeRegions",
        "ec2:DescribeReservedInstances",
        "ec2:DescribeRouteTables",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSnapshots",
        "ec2:DescribeSubnets",
        "ec2:DescribeVolumes",
        "ec2:DescribeVpcEndpoints",
        "ec2:DescribeVpcPeeringConnections",
        "ec2:DescribeVpcs",
        "ecs:DescribeCapacityProviders",
        "ecs:DescribeClusters",
        "ecs:DescribeContainerInstances",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListClusters",
        "ecs:ListContainerInstances",
        "ecs:ListServices",
        "ecs:ListTaskDefinitions",
        "ecs:ListTasks",
        "eks:DescribeCluster",
        "eks:DescribeNodegroup",
        "eks:ListClusters",
        "eks:ListNodegroups",
        "elasticache:DescribeCacheClusters",
        "elasticache:DescribeReplicationGroups",
        "elasticache:ListTagsForResource",
        "elasticbeanstalk:DescribeApplications",
        "elasticbeanstalk:DescribeEnvironmentResources",
        "elasticbeanstalk:DescribeEnvironments",
        "elasticbeanstalk:ListTagsForResource",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTags",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth",
        "glacier:ListJobs",
        "glacier:ListTagsForVault",
        "glacier:ListVaults",
        "iam:GetAccessKeyLastUsed",
        "iam:GetAccountAuthorizationDetails",
        "iam:GetAccountPasswordPolicy",
        "iam:GetAccountSummary",
        "iam:ListAccessKeys",
        "iam:ListAccountAliases",
        "iam:ListInstanceProfiles",
        "iam:ListServerCertificates",
        "iam:ListUsers",
        "kinesis:DescribeStream",
        "kinesis:ListStreams",
        "kinesis:ListTagsForStream",
        "kms:DescribeKey",
        "kms:ListKeys",
        "kms:ListResourceTags",
        "lambda:GetPolicy",
        "lambda:ListFunctions",
        "lambda:ListTags",
        "organizations:ListAccounts",
        "pricing:GetProducts",
        "rds:DescribeDbInstances",
        "rds:ListTagsForResource",
        "redshift:DescribeClusters",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ListTagsForResource",
        "s3:GetBucketTagging",
        "s3:ListAllMyBuckets",
        "servicequotas:ListServiceQuotas",
        "sns:GetPlatformApplicationAttributes",
        "sns:GetSubscriptionAttributes",
        "sns:GetTopicAttributes",
        "sns:ListEndpointsByPlatformApplication",
        "sns:ListPlatformApplications",
        "sns:ListSubscriptions",
        "sns:ListTagsForResource",
        "sns:ListTopics",
        "sqs:GetQueueAttributes",
        "sqs:ListQueueTags",
        "sqs:ListQueues"
    ],
    "Resource": "*"
});

/**
 * This is the list of permissions required for Resoto to perform tag updates, tag deletes and resource deletes.
 * Please note: those permissions are not required for the collector to work.
 *
 * To get the latest list of permissions, run the following command in the resoto repo in plugins/aws:
 * > pytest test/collector_test.py::test_all_called_apis -s
 */
export const tag_update_delete = iam.PolicyStatement.fromJson({
    "Sid": "ResotoMutatePermission",
    "Effect": "Allow",
    "Action": [
        "apigateway:DELETE",
        "apigateway:PATCH",
        "apigateway:POST",
        "apigateway:PUT",
        "athena:DeleteDataCatalog",
        "athena:DeleteWorkGroup",
        "athena:TagResource",
        "athena:UntagResource",
        "autoscaling:CreateOrUpdateTags",
        "autoscaling:DeleteAutoScalingGroup",
        "autoscaling:DeleteTags",
        "cloudformation:DeleteStack",
        "cloudformation:DeleteStackSet",
        "cloudformation:UpdateStack",
        "cloudformation:UpdateStackSet",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:TagResource",
        "cloudwatch:UntagResource",
        "cognito-idp:DeleteGroup",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:TagResource",
        "cognito-idp:UntagResource",
        "dynamodb:DeleteTable",
        "dynamodb:TagResource",
        "dynamodb:UntagResource",
        "ec2:CreateTags",
        "ec2:DeleteInternetGateway",
        "ec2:DeleteKeyPair",
        "ec2:DeleteNatGateway",
        "ec2:DeleteNetworkAcl",
        "ec2:DeleteNetworkInterface",
        "ec2:DeleteRouteTable",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteSnapshot",
        "ec2:DeleteSubnet",
        "ec2:DeleteTags",
        "ec2:DeleteVolume",
        "ec2:DeleteVpc",
        "ec2:DeleteVpcEndpoints",
        "ec2:DeleteVpcPeeringConnection",
        "ec2:DetachInternetGateway",
        "ec2:DisassociateAddress",
        "ec2:DisassociateRouteTable",
        "ec2:ReleaseAddress",
        "ec2:ReleaseHosts",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances",
        "ecs:DeleteCapacityProvider",
        "ecs:DeleteCluster",
        "ecs:DeleteService",
        "ecs:DeregisterContainerInstance",
        "ecs:DeregisterTaskDefinition",
        "ecs:PutClusterCapacityProviders",
        "ecs:StopTask",
        "ecs:TagResource",
        "ecs:UntagResource",
        "ecs:UpdateService",
        "eks:DeleteCluster",
        "eks:DeleteNodegroup",
        "eks:TagResource",
        "eks:UntagResource",
        "elasticache:AddTagsToResource",
        "elasticache:DeleteCacheCluster",
        "elasticache:DeleteReplicationGroup",
        "elasticache:RemoveTagsFromResource",
        "elasticbeanstalk:DeleteApplication",
        "elasticbeanstalk:TerminateEnvironment",
        "elasticbeanstalk:UpdateTagsForResource",
        "elasticloadbalancing:AddTags",
        "elasticloadbalancing:DeleteLoadBalancer",
        "elasticloadbalancing:DeleteTargetGroup",
        "elasticloadbalancing:RemoveTags",
        "glacier:AddTagsToVault",
        "glacier:DeleteVault",
        "glacier:RemoveTagsFromVault",
        "iam:DeleteGroup",
        "iam:DeleteGroupPolicy",
        "iam:DeleteInstanceProfile",
        "iam:DeletePolicy",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DeleteServerCertificate",
        "iam:DeleteUser",
        "iam:DeleteUserPolicy",
        "iam:DetachGroupPolicy",
        "iam:DetachRolePolicy",
        "iam:DetachUserPolicy",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:TagInstanceProfile",
        "iam:TagPolicy",
        "iam:TagRole",
        "iam:TagServerCertificate",
        "iam:TagUser",
        "iam:UntagInstanceProfile",
        "iam:UntagPolicy",
        "iam:UntagRole",
        "iam:UntagServerCertificate",
        "iam:UntagUser",
        "kinesis:AddTagsToStream",
        "kinesis:DeleteStream",
        "kinesis:RemoveTagsFromStream",
        "kms:DisableKey",
        "kms:ScheduleKeyDeletion",
        "kms:TagResource",
        "kms:UntagResource",
        "lambda:DeleteFunction",
        "lambda:TagResource",
        "lambda:UntagResource",
        "rds:AddTagsToResource",
        "rds:DeleteDbInstance",
        "rds:RemoveTagsFromResource",
        "redshift:CreateTags",
        "redshift:DeleteCluster",
        "redshift:DeleteTags",
        "route53:ChangeTagsForResource",
        "route53:DeleteHostedZone",
        "s3:DeleteBucket",
        "s3:DeleteObject",
        "s3:PutBucketTagging",
        "servicequotas:TagResource",
        "servicequotas:UntagResource",
        "sns:DeleteEndpoint",
        "sns:DeletePlatformApplication",
        "sns:DeleteTopic",
        "sns:TagResource",
        "sns:Unsubscribe",
        "sns:UntagResource",
        "sqs:DeleteQueue",
        "sqs:TagQueue",
        "sqs:UntagQueue"
    ],
    "Resource": "*"
});

/**
 * This is the permission to allow switching into the Resoto role in other accounts.
 */
export const allow_role_assume = iam.PolicyStatement.fromJson({
    "Sid": "ResotoAssumeResotoRole",
    "Effect": "Allow",
    "Action": "sts:AssumeRole",
    "Resource": "arn:aws:iam::*:role/ResotoAccess"
});
