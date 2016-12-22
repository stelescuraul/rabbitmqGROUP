/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.bankservice.controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.AMQP.BasicProperties;
import dk.bankservice.dto.LoanRequestDTO;
import dk.bankservice.dto.LoanResponseDTO;
import dk.bankservice.messaging.Send;
import java.io.IOException;
import java.util.Random;
import java.util.concurrent.TimeoutException;
import static javax.ws.rs.client.Entity.json;

/**
 *
 * @author ptoma
 */
public class CalculateQuote 
{
    private static Gson gson;
    
    
    public static void calculateInterest(String request, String properties) throws IOException, TimeoutException
    {
        gson = new Gson();
        
        
//        String corrId = java.util.UUID.randomUUID().toString();
//        BasicProperties props1 = new BasicProperties.Builder().correlationId(corrId).build();
//        System.out.println("Props1--->  " + props1.toString());
 
        AMQP.BasicProperties props = gson.fromJson(properties, AMQP.BasicProperties.class);
        System.out.println("Props--->  " + props.toString());
        
        AMQP.BasicProperties replyProps = new AMQP.BasicProperties.Builder().correlationId(props.getCorrelationId()).replyTo(props.getReplyTo()).build();


     //   AMQP.BasicProperties replyProps1 = new AMQP.BasicProperties.Builder().correlationId(props1.getCorrelationId()).replyTo("queue_reply_loanRequest").build();
     //   String loanRequestJson = gson.toJson(replyProps1);
     //   System.out.println("--rrrrrrrrrrr-> " + loanRequestJson);
        
        
        
        System.out.println("Reply--->  "+replyProps.toString());
        
        double interestRate = new Random().nextDouble()*20;
        
        
        LoanRequestDTO loanRequestDTO = gson.fromJson(request, LoanRequestDTO.class);


        
      //  LoanRequestDTO loanRequestDTO1 = new LoanRequestDTO(11111, 55555, 10, -1);//the credit score is set to -1
        
      //  Gson gson = new Gson();
      //  String loanRequestJson = gson.toJson(loanRequestDTO);
      //  System.out.println("---> " + loanRequestJson);
        
      //  Gson gson = new Gson();
      //  String loanRequestJson = gson.toJson(loanRequest);
        
        //        LoanRequestDTO loanRequestDTO1 = null;
        //        loanRequestDTO1.setSsn(4444444);
        //        loanRequestDTO1.setLoanAmount(620);
        //        loanRequestDTO1.setLoanDuration(52);
        //        loanRequestDTO1.setCreditScore(23);
        
        
        

        LoanResponseDTO loanResponseDTO = new LoanResponseDTO(interestRate, loanRequestDTO.getSsn());

        
     //    LoanResponseDTO loanResponseDTO = new LoanResponseDTO(interestRate, 1111111111);
        
        sendMessage(loanResponseDTO,replyProps);
    }
    
    public static void sendMessage(LoanResponseDTO dto, AMQP.BasicProperties props) throws IOException, TimeoutException 
    {
        String message = gson.toJson(dto);
        
        Send.sendMessage(message,props);
    }
}
