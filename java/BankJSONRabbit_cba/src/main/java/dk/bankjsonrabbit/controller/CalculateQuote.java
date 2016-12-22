/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dk.bankjsonrabbit.controller;

import com.google.gson.Gson;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.QueueingConsumer;
import dk.bankjsonrabbit.dto.LoanRequestDTO;
import dk.bankjsonrabbit.dto.LoanResponseDTO;
import dk.bankjsonrabbit.messaging.Receive;
import dk.bankjsonrabbit.messaging.Send;
import java.io.IOException;
import java.util.HashMap;
import java.util.Random;
import java.util.concurrent.TimeoutException;

/**
 *
 * @author ptoma
 */
public class CalculateQuote 
{
    private static Gson gson;
    
    public static void receiveMessages() throws IOException,InterruptedException, TimeoutException
    {
        gson = new Gson();
        
        HashMap<String,Object> objects = Receive.setUpReceiver();
        
        QueueingConsumer consumer = (QueueingConsumer) objects.get("consumer");
        Channel channel = (Channel) objects.get("channel");
        
        LoanRequestDTO loanRequestDTO;
        LoanResponseDTO loanResponseDTO;
        
        while (true) 
        {
          QueueingConsumer.Delivery delivery = consumer.nextDelivery();
          String message = new String(delivery.getBody());
          
          AMQP.BasicProperties props = delivery.getProperties();
          AMQP.BasicProperties replyProps = new AMQP.BasicProperties.Builder().correlationId(props.getCorrelationId()).replyTo(props.getReplyTo()).build();
          
          loanRequestDTO = gson.fromJson(message, LoanRequestDTO.class);
          
          double interestRate = new Random().nextDouble()*20;
          
          loanResponseDTO = new LoanResponseDTO(interestRate, loanRequestDTO.getSsn());
          
          System.out.println(loanResponseDTO.toString());
          
          sendMessage(loanResponseDTO,replyProps);
          channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        }
        
    }
    
    public static void sendMessage(LoanResponseDTO dto, AMQP.BasicProperties props) throws IOException, TimeoutException
    {
        String message = gson.toJson(dto);
        
        Send.sendMessage(message,props);
    }
}
