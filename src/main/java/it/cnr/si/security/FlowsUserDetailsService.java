package it.cnr.si.security;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import it.cnr.si.domain.User;
import it.cnr.si.repository.UserRepository;
import it.cnr.si.service.MembershipService;

/**
 * Authenticate a user from the database.
 */
@Component("flowsUserDetailsService")
@Primary
public class FlowsUserDetailsService extends UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(UserDetailsService.class);

    @Inject
    private UserRepository userRepository;
    @Inject
    private FlowsLdapUserDetailsService ldapUserDetailsService;
    @Inject
    private MembershipService membershipService;



    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Loading User {}", login);
        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
        Optional<User> userFromDatabase = userRepository.findOneByLogin(lowercaseLogin);
        if (userFromDatabase.isPresent())
            return userFromDatabase.map(user -> {
                if (!user.getActivated()) {
                    throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
                }
                List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
                        .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                    .collect(Collectors.toList());

                verificare che qui non aggiungo le cose due volte
                
                grantedAuthorities.addAll(
                        membershipService.getGroupsForUser(login).stream()
                        .map(groupname -> new SimpleGrantedAuthority(groupname))
                        .collect(Collectors.toList()));

                return new org.springframework.security.core.userdetails.User(lowercaseLogin,
                    user.getPassword(),
                    grantedAuthorities);
            }).get();
        else {


            UserDetails userFromLdap = ldapUserDetailsService.loadUserByUsername(login);

            if (userFromLdap != null)
                return userFromLdap;
            else throw new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the " +
                    "database or LDAP");
        }
    }
}
