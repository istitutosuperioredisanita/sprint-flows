package it.cnr.si.service;

import it.cnr.si.domain.Membership;
import it.cnr.si.flows.ng.service.AceBridgeService;
import it.cnr.si.repository.MembershipRepository;
import it.cnr.si.repository.RelationshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.List;

/**
 * Service Implementation for managing Membership.
 */
@Service
@Transactional
public class MembershipService {

    private final Logger log = LoggerFactory.getLogger(MembershipService.class);

    @Inject
    private MembershipRepository membershipRepository;
    @Inject
    private RelationshipRepository relationshipRepository;
    @Inject
    private AceBridgeService aceService;


    /**
     * Save a membership.
     *
     * @param membership the entity to save
     * @return the persisted entity
     */
    public Membership save(Membership membership) {
        log.debug("Request to save Membership : {}", membership);
        return membershipRepository.save(membership);
    }

    /**
     *  Get all the memberships.
     *
     *  @param pageable the pagination information
     *  @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<Membership> findAll(Pageable pageable) {
        log.debug("Request to get all Memberships");
        return membershipRepository.findAll(pageable);
    }

    /**
     *  Get one membership by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Transactional(readOnly = true)
    public Membership findOne(Long id) {
        log.debug("Request to get Membership : {}", id);
        return membershipRepository.findOne(id);
    }

    /**
     *  Delete the  membership by id.
     *
     *  @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Membership : {}", id);
        membershipRepository.delete(id);
    }


    public List<String> findMembersInGroup(String groupName) {

        List<String> result = membershipRepository.findMembersInGroup(groupName);

        List<String> usersinAceGroup = aceService.getUsersinAceGroup(groupName);
        if (usersinAceGroup != null)
            result.addAll(usersinAceGroup);

        return result;
    }
}
