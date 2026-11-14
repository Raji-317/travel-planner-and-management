package com.travel.model;

import java.sql.Timestamp;

/**
 * Domain entity for travel operators requiring administrative verification.
 */
public class OperatorProfile {
    private int operatorId;
    private String companyName;
    private String licenseNumber;
    private int yearsInBusiness;
    private String officeAddress;
    private String supportPhone;
    private String supportEmail;
    private boolean isVerified;
    private String adminNotes;
    private Timestamp verifiedAt;
    private Timestamp createdAt;

    public OperatorProfile() {}

    public int getOperatorId() { return operatorId; }
    public void setOperatorId(int operatorId) { this.operatorId = operatorId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public int getYearsInBusiness() { return yearsInBusiness; }
    public void setYearsInBusiness(int yearsInBusiness) { this.yearsInBusiness = yearsInBusiness; }

    public String getOfficeAddress() { return officeAddress; }
    public void setOfficeAddress(String officeAddress) { this.officeAddress = officeAddress; }

    public String getSupportPhone() { return supportPhone; }
    public void setSupportPhone(String supportPhone) { this.supportPhone = supportPhone; }

    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Timestamp getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Timestamp verifiedAt) { this.verifiedAt = verifiedAt; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
