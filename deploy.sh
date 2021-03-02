#!/bin/bash

# Read Username
echo -n Username:
read username
# Read Password
echo -n Password:
read -s password

repository="devops-montools_thirdparty"
groupId="com.github.iiieii"
artifactId=$(cat package.json | jq '.name' -r)
pluginId=$(cat kibana.json | jq '.id' -r)
version=$(cat package.json | jq '.version' -r)
packaging=zip
kibanaVersion=${version%.*}

curl -v \
     -F r=${repository} \
     -F hasPom=false \
     -F e=${packaging} \
     -F g=${groupId} \
     -F a=${artifactId} \
     -F v=${version} \
     -F p=${packaging} \
     -F c="kibana-${kibanaVersion}" \
     -F file=@build/${pluginId}-${kibanaVersion}.${packaging} \
     -u ${username}:${password} \
     http://sbtatlas.sigma.sbrf.ru/nexus/service/local/artifact/maven/content
