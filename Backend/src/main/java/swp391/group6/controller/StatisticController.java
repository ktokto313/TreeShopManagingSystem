package swp391.group6.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import swp391.group6.dto.OrderListDTO;
import swp391.group6.service.StatisticService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/statistic")
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @GetMapping("/profit")
    public ResponseEntity<BigDecimal> getProfit(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        if (startDate == null || endDate == null) return ResponseEntity.ok(BigDecimal.ZERO);
        BigDecimal profit = statisticService.getProfit(startDate, endDate);
        return ResponseEntity.ok(profit);
    }

    @GetMapping("/products")
    public ResponseEntity<List<swp391.group6.dto.BestSellingProductDTO>> getBestSellingProducts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        if (startDate == null || endDate == null) return ResponseEntity.ok(List.of());
        List<swp391.group6.dto.BestSellingProductDTO> products = statisticService.getBestSellingProducts(startDate, endDate);
        return ResponseEntity.ok(products);
    }
}
