/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.rulebase.dto;

import java.io.Serializable;
import java.util.Date;

/**
 *
 * @author ptoma
 */
public class LoanRequestDTO implements Serializable
{
    private static final long serialVersionUID = 1L;
    
    private String ssn;
    private int creditScore;
    private double loanAmount;
    private Date loanDuration;
    
    public LoanRequestDTO()
    {
        
    }
    
    public LoanRequestDTO(String ssn, int creditScore, double loanAmount, Date loanDuration)
    {
        this.ssn = ssn;
        this.creditScore = creditScore;
        this.loanAmount = loanAmount;
        this.loanDuration = loanDuration;
    }

    public String getSsn() {
        return ssn;
    }

    public void setSsn(String ssn) {
        this.ssn = ssn;
    }

    public int getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(int creditScore) {
        this.creditScore = creditScore;
    }

    public double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Date getLoanDuration() {
        return loanDuration;
    }

    public void setLoanDuration(Date loanDuration) {
        this.loanDuration = loanDuration;
    }
    
}
