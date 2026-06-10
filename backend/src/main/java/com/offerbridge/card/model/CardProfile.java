package com.offerbridge.card.model;

public record CardProfile(
        long id,
        String nickname,
        String bank,
        String holderName,
        String last4,
        String network,
        String expiry) {
}