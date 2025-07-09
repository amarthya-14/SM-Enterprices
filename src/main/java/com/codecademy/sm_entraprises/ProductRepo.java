package com.codecademy.sm_entraprises;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepo extends MongoRepository<Product_Details,String> {
    List<Product_Details> findByCategory(String category);
}
