package it.cnr.si.flows.ng.service;

import it.cnr.si.flows.ng.config.MailConfguration;
import it.cnr.si.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.inject.Inject;
import java.util.Map;
import java.util.Optional;

@Service
@Primary
public class FlowsMailService extends MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(FlowsMailService.class);

    public static final String FLOW_NOTIFICATION = "notificaFlow.html";
    public static final String PROCESS_NOTIFICATION = "notificaProcesso.html";
    public static final String TASK_NOTIFICATION = "notificaTask.html";
    public static final String TASK_ASSEGNATO_AL_GRUPPO_HTML = "taskAssegnatoAlGruppo.html";

    @Inject
    private TemplateEngine templateEngine;
    @Inject
    private MailConfguration mailConfig;
    @Autowired(required = false)
    private AceBridgeService aceService;

    @Async
    public void sendFlowEventNotification(String notificationType, Map<String, Object> variables, String taskName, String username, final String groupName) {
        Context ctx = new Context();
        ctx.setVariables(variables);
        ctx.setVariable("username", username);
        ctx.setVariable("groupname",  Optional.ofNullable(aceService)
                .flatMap(aceBridgeService -> Optional.ofNullable(groupName))
                .map(s ->   aceService.getExtendedGroupNome(s))
                .orElse(groupName));
        ctx.setVariable("taskName", taskName);

        String htmlContent = templateEngine.process(notificationType, ctx);

        LOGGER.info("Invio mail a {} con titolo {} del tipo {} nella fase {} e con contenuto {}", username + "@cnr.it", "Notifica relativa al flusso " + variables.get("title"), notificationType, variables.get("faseUltima"), htmlContent);

        if (!mailConfig.isMailActivated()) {
            mailConfig.getMailRecipients()
                    .forEach(r -> sendEmail(r, "Notifica relativa al flusso " + variables.get("title"), htmlContent, false, true));
        } else {
            // TODO recuperare la mail da LDAP (vedi issue #66)
            // TODO scommentare per la produzione
//            sendEmail(username, "Notifica relativa al flusso "+ variables.get("title"), htmlContent, false, true);
        }
    }
}