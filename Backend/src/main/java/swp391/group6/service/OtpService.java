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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

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
        message.setSubject("Greenshop - Mã OTP của bạn");
        message.setText("OTP của bạn: " + otp + "\nSẽ hết hạn sau 5 phút. Xin vui lòng không chia sẻ cho bất kì ai.");
        mailSender.send(message);
    }

    // BR-79: OTP has 2 types of Register/Reset Password. This type of OTP can't be used in other otp's workflow
    // BR-80: OTPs are saved in RAM and will auto delete on next access or after 5 minutes without new call.
    public boolean verify(String email, String otp, OtpType type) {
        AtomicBoolean verified = new AtomicBoolean(false);

        otpStore.computeIfPresent(email, (key, entry) -> {
            if (entry.type() != type) {
                return entry;
            }

            if (LocalDateTime.now().isAfter(entry.expiry())) {
                return null;
            }

            if (!entry.otp().equals(otp)) {
                return entry;
            }

            verified.set(true);
            return null;
        });

        return verified.get();
    }

    // BR-80: OTPs auto delete after 5 minutes without new call
    @Scheduled(fixedRate = 60_000)
    public void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStore.entrySet().removeIf(e -> now.isAfter(e.getValue().expiry()));
    }

    private record OtpEntry(String otp, LocalDateTime expiry, OtpType type) {}
}