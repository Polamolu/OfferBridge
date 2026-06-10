package com.offerbridge.card.repository;

import com.offerbridge.card.model.CardProfile;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryCardProfileRepository implements CardProfileRepository {

    private final List<CardProfile> profiles = new CopyOnWriteArrayList<>();
    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public List<CardProfile> findAll() {
        return new ArrayList<>(profiles);
    }

    @Override
    public CardProfile save(CardProfile profile) {
        CardProfile storedProfile = new CardProfile(
                sequence.getAndIncrement(),
                profile.nickname(),
                profile.bank(),
                profile.holderName(),
                profile.last4(),
                profile.network(),
                profile.expiry());
        profiles.add(0, storedProfile);
        return storedProfile;
    }

    @Override
    public void deleteById(long id) {
        profiles.removeIf(profile -> profile.id() == id);
    }

    @Override
    public void clear() {
        profiles.clear();
    }
}