// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {
    struct Cert {
        string studentName;
        string course;
        uint256 issueDate;
        address issuer;
    }

    mapping(bytes32 => Cert) public certificates;

    event CertificateIssued(bytes32 indexed certId, string studentName, string course, uint256 issueDate, address issuer);

    function issueCertificate(string memory studentName, string memory course) public returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(studentName, course));
        certificates[certId] = Cert(studentName, course, block.timestamp, msg.sender);
        
        emit CertificateIssued(certId, studentName, course, block.timestamp, msg.sender);

        return certId;
    }

    function getCertificate(bytes32 certId) public view returns (string memory, string memory, uint256, address) {
        Cert memory cert = certificates[certId];
        return (cert.studentName, cert.course, cert.issueDate, cert.issuer);
    }
}
