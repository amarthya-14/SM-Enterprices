package com.codecademy.sm_entraprises;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/details")

public class ProductController {
   @Autowired
   private ProductRepo productRepo;
  @GetMapping
    public Iterable<Product_Details> findAll() {
        return productRepo.findAll();
    }
    @GetMapping("/{category}")
    public List<Product_Details> findByCategory(@PathVariable String category) {
      return productRepo.findByCategory(category);
    }
    @PostMapping("/add")
    public Product_Details save(@RequestBody Product_Details productDetails) {
      return productRepo.save(productDetails);
    }

}
