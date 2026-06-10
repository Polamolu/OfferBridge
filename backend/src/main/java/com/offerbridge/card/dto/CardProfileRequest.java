package com.offerbridge.card.dto;

public record CardProfileRequest(
        String nickname,
        String bank,
        String holderName,
        String last4,
        String network,
        String expiry) {
}