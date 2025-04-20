import { useEffect, useState } from 'react';
import Web3 from "web3";
import CertificateJSON from "./contracts/Certificate.json";

function App() {
  const [web3obj, setWeb3Obj] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [certId, setCertId] = useState("");

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts"});

         const accounts = await web3.eth.getAccounts();
         setAccount(accounts[0]);

         const networkId = await web3.eth.net.getId();
         console.log("Network ID:", networkId);
         console.log("CertificateJSON networks:", CertificateJSON.networks);
         const deployedNetwork = CertificateJSON.networks[networkId];
         if (deployedNetwork) {
          const instance = new web3.eth.Contract(
            CertificateJSON.abi,
            deployedNetwork.address
          );
          setContract(instance);
         } else {
          alert("Smart contract not deployed to network!");
         }
         setWeb3Obj(web3);
      } else {
        alert("Please install metamask.");
      }
    };
    loadBlockchainData();
  }, []);

  const handleIssueCertificate = async () => {
    if (contract && studentName && courseName) {
      try {
        const receipt = await contract.methods.issueCertificate(studentName, courseName).send({ from: account });
  
        const certId = receipt.events.CertificateIssued.returnValues.certId;
        
        alert(`Certificate Issued! Cert ID: ${certId}`);
        setCertId(certId);
      } catch (error) {
        console.error(error);
        alert("Error issuing certificate.");
      }
    }
  }
  
  
  const handleValidateCertificate = async () => {
    if (contract && certId) {  
      try {
        const result = await contract.methods.getCertificate(certId).call();
        console.log(result);
        if (result.issueDate != "0") {
          setCertificate(result);
        } else {
          setCertificate(null);
          alert("Certificate not found.");
        }
      } catch (error) {
        console.error(error);
        alert("Error retrieving certificate.");
      }
    }
  };
  
  


  return (
    <div>
      <h1>Certificate DApp</h1>
      <p>Connected Account: {account}</p>

      <div className="container">
        <h3>Issue Certificate</h3>
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <button onClick={handleIssueCertificate}>Issue</button>
        {certId && (
          <p>Issued Certificate ID: ${certId}</p>
        )}
      </div>

      <div>
        <h3>Validate Certificate</h3>
        <input
          type="text"
          placeholder="Enter Cert ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
        />
        <button onClick={handleValidateCertificate}>Validate</button>
      </div>
      {certificate && (
        <div>
          <h4>Certificate Details:</h4>
          <p>Student: {certificate[0]}</p>
          <p>Course: {certificate[1]}</p>
          <p>Issued: {certificate[2] ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}

export default App;