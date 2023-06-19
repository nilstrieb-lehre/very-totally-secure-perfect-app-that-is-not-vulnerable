package ch.bbw.m183.vulnerapp.controller;

import ch.bbw.m183.vulnerapp.datamodel.BlogEntity;
import ch.bbw.m183.vulnerapp.service.BlogService;
import ch.bbw.m183.vulnerapp.service.HealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
@Slf4j
public class BlogController {

    private final BlogService blogService;

    private final HealthService healthService;

    @GetMapping
    public Page<BlogEntity> getBlogs(@PageableDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        return blogService.getBlogs(pageable);
    }

    @PostMapping
    public ResponseEntity<UUID> createBlog(@RequestBody BlogEntity blog, Authentication authentication) {
        log.error("jaaaaaaa {} {}", authentication.getName(), authentication.getAuthorities());
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.createBlog(blog));
    }

    @GetMapping("/health")
    public String health(@RequestHeader String host) {
        return healthService.health(host);
    }
}
