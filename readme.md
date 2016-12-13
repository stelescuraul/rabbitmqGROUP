This is the project for Group X

In order to run the whole suite you have to:
1. Have nodejs and npm installed in your system and setup environment variables
2. Run the java servers :
  - BankService : folder name
  - BankJSONRabbit : folder name
  - RuleBaseServer : folder name
3. From {nodejs folder name} do npm install
4. From {nodejs folder name} do 'node setup.js' (optional)
5. From {nodejs folder name} do 'node server.js'

OBS: If your glassfish server is running on a different port than 8080, then you have to go to the following files and change the port:
  - {node folder name}/core/ruleService.js line 11 (host: 'http://localhost:7999/') change the 7999 to the port your glassfish server is running
  //- {node folder name}/core/ruleService.js line 11 (host: 'http://localhost:7999/') change the 7999 to the port your glassfish server is running
  //- {node folder name}/core/ruleService.js line 11 (host: 'http://localhost:7999/') change the 7999 to the port your glassfish server is running

Now that your server is running, you should see in your console `Listening on port: 1337`. You can go to : localhost:1337 in your browser run the client

Screen dumps are in folder 'screenshots'

Diagrams are in folder 'diagrams'

Possible bottlenecks in our application might be because of the connectivity between our components and queue server / java servers if they will be deployed somewhere else than locally.

We have used nodejs to develop the core components of the messaging system (aggregator, normalizer, translators etc). Using javascript has it's perks, such as
a lot flexibility, but at the same time there are drawbacks as well. Looking at flexibility, it helped us develop the application faster and it gives you more freedom within your application
but you can also argue that because we don't have types in our application, type checking (ifs) are required and therefore increasing the cyclomatic complexity. Would this have a big inpact
in our project ? Not really. In this specific project and because node is desined to work, the application is scalable and fast, however testing (especially for bad input) is a must to if
this application would be developed for a client. Something like TDD would work just fine.

Since we are on the subject of testing, our application is designed with ES6 classes which easily allowed us to create classes with dependancy injection. The two modules in `amqp` folder
are designed for dependancy injection. Take the listner for example: It requires the `amqp` module and an `options` object. That will allow us to create mocks or stubs to test the functionality
properly. The modules in `core` folder are also designed with classes, however, they are not accepting listner or producers as dependencies but instead they create their own. There is no
reason for this behaviour other than simplicity when writing the classes. This is also a 'do as I say, not as I do' example in the way that those modules should be changed to accept dependencies
in constructor, not creating their own (it is harder to test and find out where the flow actually breaks).

From a design perspective, our components are as decoupled as possible. Each component contains logic only for itself and it requires external component if extra functionality is needed. For example
the creditScore needs to make a soap call to the credit score service, but in order to do that, it requires the 'soapClient' module and call it's function. This way, each component is responsible
only for their own functionality. We also have a Mapper ('socketMapper.js' in 'sockets' folder) that is shared with multiple modules. Because our solution is a 'all-in-one' server, we can afford
to share components with eachother. If, for example, each component would be separate, running on different hosts, we would have created another service that would be the mapper (one of the solutions).

We have used websockets to communicate between the client and the server and we use a mapper (socketMapper) to map each request to a socket and furter to each message. This is used to solve the issue
if the same client makes 10 requests, then we should wait for each request and their own payload and be sure we don't mix the payload of the messages. The use of the mapper ensures that each client
will receive the responses back and each response is related to the proper request and message.

When we talk about data validation, we go back to the problem of the strong typed language, which javascript isn't. We could have used typescript to force types on our inputs, but the complexity
of the project would have increased because we whould have had to use a transpiler In our solution we check for the types we expect in the following way:
(code from creditScore.js)
      if (message && _.isObject(message)) -> checks if there is a message and if it is a object
      if (message.ssn && _.isString(message.ssn) && message.loanAmount && _.isNumber(message.loanAmount) && message.loanDuration && _.isDate(message.loanDuration)) -> checks if there is an ssn
        property on message object and if it is a string, if there is a loanAmount property on message object and if it is a number and also if there is a loanDuration property in message object
        and if it is a date
We can all agree that it is easy to miss a type check that would crash the server, that is why tests would be a `must have`.

When an exception happens, we need to notify the client about it (reason why it failed for example). As an example, in our 'recipientList.js', if the credit score is too low and the message should
not be sent to any banks, the client gets notified back through the socket about it. Line 87 in 'recipientList.js'. Again, we use the mapper to grab the socket and send the response. This type of
reply should be available in multiple modules in order to handle exceptions.