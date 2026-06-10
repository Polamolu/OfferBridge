package com.offerbridge.card.service;

import com.offerbridge.card.dto.CardProfileRequest;
import com.offerbridge.card.model.CardProfile;
import com.offerbridge.card.repository.CardProfileRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CardProfileService {

    private final CardProfileRepository repository;

    public CardProfileService(CardProfileRepository repository) {
        this.repository = repository;
    }

    public List<CardProfile> findAll() {
        return repository.findAll();
    }

    public CardProfile create(CardProfileRequest request) {
        CardProfile profile = new CardProfile(
                0,
                request.nickname(),
                request.bank(),
                request.holderName(),
                request.last4(),
                request.network(),
                request.expiry());
        return repository.save(profile);
    }

    public void deleteById(long id) {
        repository.deleteById(id);
    }

    public void clear() {
        repository.clear();
    }
}