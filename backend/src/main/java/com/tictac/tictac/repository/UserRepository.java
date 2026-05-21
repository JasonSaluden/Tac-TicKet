package com.tictac.tictac.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole_Name(RoleName roleName);

    @Query(value = "SELECT id_category FROM user_category WHERE id_user = :userId", nativeQuery = true)
    List<Long> findCategoryIdsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM user_category WHERE id_user = :userId", nativeQuery = true)
    void deleteAllCategoriesByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "INSERT INTO user_category (id_user, id_category) VALUES (:userId, :categoryId)", nativeQuery = true)
    void insertUserCategory(@Param("userId") Long userId, @Param("categoryId") Long categoryId);
}
