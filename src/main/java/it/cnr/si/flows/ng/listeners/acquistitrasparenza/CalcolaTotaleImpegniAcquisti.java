package it.cnr.si.flows.ng.listeners.acquistitrasparenza;

import org.activiti.engine.delegate.BpmnError;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;



@Component
public class CalcolaTotaleImpegniAcquisti implements ExecutionListener {
    private static final long serialVersionUID = 686169707042367215L;
    private static final Logger LOGGER = LoggerFactory.getLogger(CalcolaTotaleImpegniAcquisti.class);


    @Override
    public void notify(DelegateExecution execution) throws Exception {

        double importoTotale = 0.0;

        String impegniString = (String) execution.getVariable("impegni_json");
        JSONArray impegni = new JSONArray(impegniString);

        for ( int i = 0; i < impegni.length(); i++) {

            JSONObject impegno = impegni.getJSONObject(i);
            try {
                importoTotale += impegno.getDouble("importo");
            } catch (JSONException e) {
                LOGGER.error("Formato Impegno Non Valido {} nel flusso {} - {}", impegno.getString("importo"), execution.getId(), execution.getVariable("title"));
                throw new BpmnError("400", "Formato Impegno Non Valido: " + impegno.getString("importo"));
            }
        }

        execution.setVariable("importoTotale", importoTotale);
    }
}
