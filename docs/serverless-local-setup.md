<!-- Serverless setup on macOS M1 -->

<!-- Install Homebrew -->

<!-- Install Node.js -->

<!-- Install Serverless globally using npm -->
npm install -g serverless

<!-- Install Rosetta (for compatibility) -->
sudo softwareupdate --install-rosetta

<!-- Install AdoptOpenJDK 8 -->
brew install --cask adoptopenjdk/openjdk/adoptopenjdk8

<!-- Change directory to your project folder -->
cd /path/to/project/folder

<!-- Install serverless-dynamodb-local package -->
npm install serverless-dynamodb-local

<!-- Install serverless-offline package -->
npm install serverless-offline

<!-- Create a .dynamodb folder in the project root -->

<!-- Download the DynamoDB Local JAR file from the AWS website -->

<!-- Unarchive the downloaded file and move it to the .dynamodb folder in your project -->

<!-- Change directory to the newly unzipped dynamodb_local_latest folder -->
cd /path/to/project/.dynamodb/dynamodb_local_latest

<!-- Run the following command to start DynamoDB Local -->
java -Djava.library.path=./dynamodb_local_latest/ -jar DynamoDBLocal.jar -sharedDb

<!-- Change back to the project root directory -->
cd /path/to/project

<!-- Install the AWS CLI using Homebrew -->
brew install awscli

<!-- Login to Serverless -->
serverless login

<!-- Install the Serverless DynamoDB plugin -->
serverless dynamodb install

<!-- Apply the bug fix mentioned in this GitHub issue (https://github.com/99x/serverless-dynamodb-local/issues/294) -->

<!-- Run the following command to reinstall DynamoDB Local -->
sls dynamodb install

<!-- Install the dynamodb-admin package globally -->
npm install -g dynamodb-admin

<!-- Create a data folder in .dynamodb folder (if required in serverless.yml) -->

<!-- Start DynamoDB Local -->
sls dynamodb start

<!-- Start the Serverless and DynamoDB Offline -->
sls offline start

<!-- Start DynamoDB Admin (DynamoDB Local UI) -->
dynamodb-admin &
