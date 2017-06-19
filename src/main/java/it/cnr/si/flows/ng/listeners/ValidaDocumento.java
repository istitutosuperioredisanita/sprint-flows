package it.cnr.si.flows.ng.listeners;

import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import it.cnr.jada.firma.arss.ArubaSignServiceException;
import it.cnr.si.flows.ng.dto.FlowsAttachment;
import it.cnr.si.flows.ng.exception.TaskFailedException;
import it.cnr.si.flows.ng.service.FlowsFirmaService;

@Component
public class ValidaDocumento implements ExecutionListener {

    private static final long serialVersionUID = -56001764662303256L;

    private static final Logger LOGGER = LoggerFactory.getLogger(ValidaDocumento.class);

    private Expression nomeFileDaValidare;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        if (!execution.getEventName().equals(ExecutionListener.EVENTNAME_TAKE))
            throw new IllegalStateException("Questo Listener accetta solo eventi 'take'.");
        if (nomeFileDaValidare.getValue(execution) == null)
            throw new IllegalStateException("Questo Listener ha bisogno del campo 'nomeFileDaValidare' nella process definition (nel Task Listener - Fields).");

        String nomeVariabileFile = (String) nomeFileDaValidare.getValue(execution);

        FlowsAttachment att = (FlowsAttachment) execution.getVariable(nomeVariabileFile);
        att.setAzione(FlowsAttachment.Azione.Validazione);
        att.addStato(FlowsAttachment.Stato.Validato);
        execution.setVariable(nomeVariabileFile, att);

        String isError = (String) execution.getVariable("error");
        if ("true".equals(isError)) {
            throw new IllegalStateException("L'utente ha selezionato l'opzione errore. Rollback.");
        }

    }

}
