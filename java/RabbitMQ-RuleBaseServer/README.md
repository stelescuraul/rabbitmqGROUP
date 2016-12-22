# RabbitMQ-RuleBaseServer

## Table of Contents
1. [How to run](###How to run)
2. [Choose Bank Logic](#### Choose Bank Logic)
3. [Links](####Links)


###How to run

 1. Run project.
 2. Click -> [here](http://localhost:8080/RuleBaseService/RuleBaseService?Tester) <- to run Test web page.
 3. Type data values:
	- String ssn ()
    - int creditScore ()
    - double loanAmount ()
    - Date loanDuration ()

#### Choose Bank Logic

```java
if (creditScore < 580)
      return null;
if (creditScore >= 720)
      get 4 banks as result;
if (creditScore >= 680 && creditScore <= 719)
      get 3 banks as result;
if (creditScore >= 620 && creditScore <= 679)
      get 2 banks as result;
if (creditScore >= 580 && creditScore <= 619)
      get 1 bank;

 return selectedBank as result;
```

####Links
[Jenkins](http://138.68.86.0:8081/job/backend/)
[Artifactory](http://138.68.86.0:8082/artifactory/webapp/builds/backend/?0)

[Getting Started with JAX-WS Web Services](https://netbeans.org/kb/docs/websvc/jax-ws.html)
[How to deploy Maven based war file to Tomcat](https://www.mkyong.com/maven/how-to-deploy-maven-based-war-file-to-tomcat/)
[Deploy JAX-WS web services on Tomcat](https://www.mkyong.com/webservices/jax-ws/deploy-jax-ws-web-services-on-tomcat/)

#### TODO 
 - are there predefined creditScore Values ? -> "NO"
