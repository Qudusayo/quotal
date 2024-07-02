"use client";

import { useEffect, useState } from "react";
import { DataTable, iRequest } from "./table";
import { formatUnits } from "viem";
import { useAppContext } from "@/context/app-context";
import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { checkStatus, getDecimals, getSymbol } from "@/lib/utils";

const SentInvoices = () => {
  const { address, requestNetwork, getRequests } = useAppContext();
  const [requests, setRequests] = useState<IRequestDataWithEvents[]>([]);
  const [requestTableDetails, setRequestTableDetails] = useState<iRequest[]>(
    []
  );

  useEffect(() => {
    (async () => {
      const requests = await getRequests();
      console.log(requests);
      if (!requests) return;

      setRequests(requests);

      console.log("REQUESTS", requests);
      const sentInvoices: iRequest[] = requests?.map(
        (request: IRequestDataWithEvents) => {
          return {
            amount: formatUnits(
              BigInt(request.expectedAmount),
              getDecimals(
                request.currencyInfo.network ?? "",
                request.currencyInfo.value
              )
            ),
            creation_date: new Date(
              request.timestamp * 1000
            ).toLocaleDateString(),
            due_date: request?.contentData?.paymentTerms?.dueDate
              ? new Date(
                  request?.contentData?.paymentTerms?.dueDate
                ).toLocaleDateString()
              : "-",
            invoice_id: request.contentData.invoiceNumber || "-",
            payment_method:
              getSymbol(
                request.currencyInfo.network ?? "",
                request.currencyInfo.value
              ) || "-",
            payment_status: checkStatus(request),
            payer: request.payer?.value ?? "",
            recipient: request.payee?.value ?? "",
          };
        }
      );
      setRequestTableDetails(sentInvoices);
    })();
  }, [requestNetwork, address]);

  return (
    <div className="w-[95%] mx-auto">
      <h1 className="text-2xl">Sent Invoices</h1>
      <p>Here you can see all the invoices you have sent.</p>
      <div>
        <DataTable data={requestTableDetails} requests={requests} />
      </div>
    </div>
  );
};

export default SentInvoices;
