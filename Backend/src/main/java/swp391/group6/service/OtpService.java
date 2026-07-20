/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: OtpService.java
 * Description:
 * Last Change Author: HungDLM
 * Last Change Date: 2026-07-20
 */
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

    // BR-79: the two OTP types — an OTP generated for one workflow cannot validate in the other's
    public enum OtpType {
        REGISTER,
        RESET_PASSWORD
    }

    private final JavaMailSender mailSender;

    //BR-80: OTPs are saved in RAM and will auto delete on next access or after 5 minutes without new call.
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    //BR-80: OTPs are saved in RAM and will auto delete on next access or after 5 minutes without new call.
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

    // BR-79: OTP has 2 types of Register/Reset Password. This type of OTP can’t be used in other otp’s workflow
    //BR-80: OTPs are saved in RAM and will auto delete on next access or after 5 minutes without new call.
    public boolean verify(String email, String otp, OtpType type) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;

        // check OTP type
        if (entry.type() != type) return false;

        // check expiring time
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