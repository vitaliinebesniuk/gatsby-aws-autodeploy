## Hosting WebApp in S3:

Create an S3 Bucket and enter the bucket name and select a region. Enable static website hosting and add permissions in Bucket policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:List*",
                "s3:Put*",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::contentful.mort-vivant.me",
                "arn:aws:s3:::contentful.mort-vivant.me/*"
            ]
        }
    ]
}
```

## Build Gatsby Website Automatically Using AWS CodeBuild
The first thing that we need is a set of instructions for building the Gatsby site. Since the build server starts clean every time this includes downloading Gatsby and all the dependencies that we require. One of the o ptions that CodeBuild has for specifying the build instruction is the `buildspec.yaml` file.
Navigate to the CodeBuild console and create a new project using the following settings:
-   **Project name:**  `gatsby-contentful`
-   **Source provider:** `GitHub`
-   **Repository:** `Use a repository in my account`
-   **Choose a repository:** `Choose your GitHub repository`
-   **Environment image:**  `Use an image managed by AWS CodeBuild`
-   **Operating System:** `Ubuntu` 
-   **Runtime:** `Node.js`
-   **Runtime version:** `aws/codebuild/nodejs:8.11.0`
-   **Buildspec name:** `buildspec.yml`
-   **Artifact type:**  `No artifact`
-   **Service role:**  `Create a service role in your account`
***Show advanced settings***
- **Environment variables** Add environment variables that are called `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` from Contenful

## Using AWS CodePipeline to rebuild every time a code change is pushed to repository
Go to the AWS Management Console and open the AWS CodePipeline console 
then choose **Create pipeline**.
In **Step 1: Name**, in **Pipeline name**, type name of Pipeline
In **Step 2: Source**, in **Source provider**, choose **GitHub**, and click **Connect to GitHub** button. Choose a repository from the list of repositories, and then select the branch you want to use.
In **Step 3: Build**,  in **Build provider**, choose **AWS CodeBuild**. In **Project name**, choose the project name from the list.
In **Step 4: Deploy**,   choose **No Deployment**.
In  **Step 5: Service Role**, choose  **Create role**.
On the IAM console page that describes the AWS-CodePipeline-Service role to be created for you, choose  **Allow**.
In **Step 6: Review**, review the information, and then choose **Create pipeline**.

The pipeline automatically starts to run. You can view progress and success and failure messages.

## Create Lambda function
Click **Create function** and in **Author from scratch**, do the following:
-   In  **Name***, specify your Lambda function name.
-   In  **Runtime***, choose  `Python 3.6`.
-   In  **Role***, choose  **Create a custom role** 
-   In  **Existing role***, choose created role.
- Choose **Create Function.**

Paste following code in the**Function code** section to build CodeBuild project
```python
import boto3, json

def lambda_handler(event, context):
    
    client = boto3.client('codebuild')
    
    response = client.start_build(
        projectName='gatsby-contentful'
    )
    return "Build triggered"
    
    print(response)
```
Save function  and click **Test** to run function. This will run building the CodeBuild project

## API gateway
To run an  automatic project rebuild, after changes on Contentful, need to create Invoke URL on  API Gateway.
Create new API and create POST method on the `/` resource. 
In the **Deploy API** dialog, create  `[New Stage]` and then choose **Deploy**.
Once deployed, you can obtain the invocation URLs (**Invoke URL**) of the API's endpoints.
In the **API Keys** section create new API key. Then go to      POST Method Request and change **API Key Required** to `true`
 
## Creating IAM user
For building project, deploy to S3  and enable CloudFront Invalidation we need to create an individual  IAM user. Add IAM user and attach **AmazonS3FullAccess** policy.
Also, you need to add a policy for the IAM user, which will be called *CodeBuildBasePolicy-**[codebuild-project-name]**-**[aws-region-name]***
and *AWSLambdaBasicExecutionRole* created in Lmbda

Now whenever you make a change in the Github repository or Contentful your website will be updated.
