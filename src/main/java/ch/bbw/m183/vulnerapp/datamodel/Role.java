package ch.bbw.m183.vulnerapp.datamodel;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {
    public Role() {}

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank(message = "name must not be empty")
    private String name;
    @ManyToMany(mappedBy = "roles")
    private Collection<UserEntity> users;

    public Role(String name) {
        this.name = name;
    }

    @ManyToMany
    @JoinTable(
            name = "roles_privileges",
            joinColumns = @JoinColumn(
                    name = "role_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(
                    name = "privilege_id", referencedColumnName = "id"))
    private Collection<Privilege> privileges;
}
