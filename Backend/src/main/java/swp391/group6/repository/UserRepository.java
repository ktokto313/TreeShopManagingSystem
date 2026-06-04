package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("""
            select u
            from User u
            where lower(u.fullName) like lower(concat('%', :query, '%'))
               or lower(u.email) like lower(concat('%', :query, '%'))
               or lower(coalesce(u.phone, '')) like lower(concat('%', :query, '%'))
            """)
    List<User> search(@Param("query") String query);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByStatus(boolean status);
}

