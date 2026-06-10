package com.offerbridge.card.repository;

import com.offerbridge.card.model.CardProfile;
import java.util.List;

public interface CardProfileRepository {

    List<CardProfile> findAll();

    CardProfile save(CardProfile profile);

    void deleteById(long id);

    void clear();
}