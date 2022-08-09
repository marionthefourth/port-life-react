# Port Life

## **_Installing and Running the Full-Stack Application_**

```
$ git clone https://github.com/marionthefourth/port-life-react.git
$ yarn
$ yarn start
```

## `yarn start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## `npm start`
Also runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Setup for Verifiable Credential
This app uses a passwordless method of authentication. When a user first accesses the application, Port-Life requests
 information from the user such as their name and job position. The user has to present a VC as proof. In this demo, 
 this proof will come from a Government employer, such as the DoD.
 
For this demo, we will use the Trinsic API. Complete the following steps:
1. Download and install the [Trinsic mobile wallet](https://trinsic.id/trinsic-wallet/) on your mobile 
device. 
2. Create an account on [Trinsic Studio website](https://studio.trinsic.id/).
3. Create an organization to represent where your VC will come from. Name it the name of the organization that would 
be issuing the credentials (such as *DoD* or *Government*). Choose the *Sovrin Staging Network*.
4. Click the organization you just created. Click *Credentials*. Create a new Credential Template. Name it 
*Employee Certificate*. Add the following attributes: First Name, Last Name, Job Title. Click through to confirm the 
template. It'll take a minute to confirm. 
5. Click the offer link on the Credential Template you just created. Enter info for a test user (or your own info). 
Once the offer is created, scan the QR code with your mobile wallet and accept it. Now you have the credential you will 
present when logging into Port-Life.
6. Return to the Trinsic Studio home page. Create a new organization and call it *Port-Life*. 
7. Click the Verifications link and create a new template. Enter *Employee Verification* for the Verification Title 
and the Requested Credential Name. Enter *First Name*, *Last Name*, and *Job Title* for the Requested Attributes 
fields. Click Create. This will be used to request a user's credentials when they go to Port-Life. 
9. In the port-life-react project, make a copy of the .env-template file in the same directory and 
rename it to *.env*. Update the environment variables with values from the Trinsic Studio: 
* **REACT_APP_ACCESSTOK** - Found under the API Key field in the details of the Verifying organization (Port-Life). 
* **REACT_APP_POLICY_ID** - Found in the Verification ID field on the Verifications page of the Verifying organization 
(Port-Life).
* **REACT_APP_SCHEMA_ID** - Found under the Schema ID field in the issuing organization's Credential template details 
section.


