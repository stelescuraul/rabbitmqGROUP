/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.bankjsonrabbit.main;

import dk.bankjsonrabbit.controller.CalculateQuote;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

/**
 *
 * @author ptoma
 */
public class BankRabbit {

    /**
     * @param args the command line arguments
     * @throws java.io.IOException
     * @throws java.lang.InterruptedException
     */
    public static void main(String[] args) throws IOException, InterruptedException, TimeoutException 
    {
        CalculateQuote.receiveMessages();
    }
    
}
