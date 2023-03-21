package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Photo;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.annotations.QueryHints;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class PhotoRepositoryWithBagRelationshipsImpl implements PhotoRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Photo> fetchBagRelationships(Optional<Photo> photo) {
        return photo.map(this::fetchTags);
    }

    @Override
    public Page<Photo> fetchBagRelationships(Page<Photo> photos) {
        return new PageImpl<>(fetchBagRelationships(photos.getContent()), photos.getPageable(), photos.getTotalElements());
    }

    @Override
    public List<Photo> fetchBagRelationships(List<Photo> photos) {
        return Optional.of(photos).map(this::fetchTags).orElse(Collections.emptyList());
    }

    Photo fetchTags(Photo result) {
        return entityManager
            .createQuery("select photo from Photo photo left join fetch photo.tags where photo is :photo", Photo.class)
            .setParameter("photo", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Photo> fetchTags(List<Photo> photos) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, photos.size()).forEach(index -> order.put(photos.get(index).getId(), index));
        List<Photo> result = entityManager
            .createQuery("select distinct photo from Photo photo left join fetch photo.tags where photo in :photos", Photo.class)
            .setParameter("photos", photos)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
