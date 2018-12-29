# Prerequisites:
# install HomeBrew: https://brew.sh/

source ./.env;

echo ${MONGO_LOCAL_DATA_PATH}

brew update && \                                    # Update homebrew
brew install mongodb && \                           # Install developer version of MongoDB
mkdir -p ${MONGO_LOCAL_DATA_PATH} && \                      # Create MongoDB data directory
npm install
