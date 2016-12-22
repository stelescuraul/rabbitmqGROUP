/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.rulebase.service;

import dk.rulebase.facade.Controller;
import java.util.Date;
import java.util.List;
import javax.jws.WebService;
import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.ejb.Stateless;

/**
 *
 * @author ptoma
 */
@WebService(serviceName = "RuleBaseService")
@Stateless()
public class RuleBaseService {

    /**
     * Web service operation
     * @param ssn
     * @param creditScore
     * @param loanAmount
     * @param loanDuration
     * @return 
     */
    @WebMethod(operationName = "chooseAppropriateBank")
    public List<String> chooseAppropriateBank(@WebParam(name = "ssn") String ssn, @WebParam(name = "creditScore") int creditScore, @WebParam(name = "loanAmount") double loanAmount, @WebParam(name = "loanDuration") Date loanDuration) {
        
        Controller controller = new Controller(ssn, creditScore, loanAmount, loanDuration);

        
        return controller.selectSuitableBanks();
    }
}
