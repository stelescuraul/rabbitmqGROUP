/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.bankjsonrabbit.dto;

import java.io.Serializable;

/**
 *
 * @author ptoma
 */
public class LoanResponseDTO implements Serializable
{
    private static final long serialVersionUID = 1L;
    
    private double interestRate;
    private long ssn;
    
    public LoanResponseDTO()
    {
    }
    
    public LoanResponseDTO(double interestRate, long ssn)
    {
        this.interestRate = interestRate;
        this.ssn = ssn;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public long getSsn() {
        return ssn;
    }

    public void setSsn(long ssn) {
        this.ssn = ssn;
    }

    @Override
    public String toString() {
        return "LoanResponseDTO{" + "interestRate=" + interestRate + ", ssn=" + ssn + '}';
    }
    
    
    
}
