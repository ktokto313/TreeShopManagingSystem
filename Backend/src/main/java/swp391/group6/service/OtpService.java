/*
 * Author: Hung Dao
 * Created Date: 2026-06-07
 * Name: OtpService.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-22
 */
//6/7: Hung Dao: otp service
package swp391.group6.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    public enum OtpType {
        REGISTER,
        RESET_PASSWORD
    }

    private final JavaMailSender mailSender;

    // email -> OTP entry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void generateAndSend(String email, OtpType type) {
        String otp = String.format("%06d", new Random().nextInt(999999));

        otpStore.put(email, new OtpEntry(
                otp,
                LocalDateTime.now().plusMinutes(5),
                type
        ));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Greenshop - Your OTP Code");
        message.setText("Your OTP code is: " + otp + "\nThis code will expire in 5 minutes.");
        mailSender.send(message);
    }

    public boolean verify(String email, String otp, OtpType type) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;

        // check đúng loại OTP
        if (entry.type() != type) return false;

        // check hết hạn
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            otpStore.remove(email);
            return false;
        }

        // check otp
        if (!entry.otp().equals(otp)) return false;

        otpStore.remove(email);
        return true;
    }

    private record OtpEntry(String otp, LocalDateTime expiry, OtpType type) {}
}