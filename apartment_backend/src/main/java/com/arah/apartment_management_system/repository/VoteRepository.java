package com.arah.apartment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.arah.apartment_management_system.entity.Poll;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.entity.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long>{
	boolean existsByUserAndPoll(User user, Poll poll);

	@org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Vote v JOIN v.user u JOIN u.allotments a WHERE v.poll = :poll AND a.flat.id = :flatId AND a.status = 'ACTIVE'")
	boolean existsByFlatAndPoll(@org.springframework.data.repository.query.Param("flatId") Long flatId, @org.springframework.data.repository.query.Param("poll") Poll poll);
}
