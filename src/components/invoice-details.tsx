import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  payRequest,
  approveErc20,
  hasErc20Approval,
} from "@requestnetwork/payment-processor";
import { useAppContext } from "@/context/app-context";
import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { getPaymentNetworkExtension } from "@requestnetwork/payment-detection";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { providers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "./ui/badge";
import { checkStatus, cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";

export function InvoiceDetails({
  isOpen,
  setIsOpen,
  request,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  request: IRequestDataWithEvents;
}) {
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { address } = useAppContext();
  const weiToEth = (wei: string) => {
    return parseFloat(wei) / 10 ** 18;
  };

  const checkApproval = async (requestData: any, signer?: any) => {
    return await hasErc20Approval(requestData!, address!, signer);
  };

  const requestNetwork = () => {
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);

    const requestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network",
      },
      signatureProvider: web3SignatureProvider,
    });
    return requestNetwork;
  };

  const checkInvoice = async () => {
    try {
      setIsLoading(true);
      const singleRequest = await requestNetwork()?.fromRequestId(
        request!.requestId
      );
      const requestData = singleRequest?.getData();
      const isPaid =
        requestData?.balance?.balance! >= requestData?.expectedAmount;
      setIsPaid(isPaid);
    } catch (err: any) {
      if (String(err).includes("Unsupported payment")) {
        // unsupportedNetwork = true;
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkInvoice();
  }, [isOpen]);

  async function approve() {
    try {
      setIsLoading(true);
      if (
        getPaymentNetworkExtension(request!)?.id ===
        Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT
      ) {
        const provider = new providers.Web3Provider((window as any).ethereum);
        const signer = provider.getSigner();
        const approvalTx = await approveErc20(request!, signer);
        await approvalTx.wait(2);
        setIsApproved(true);
      }
    } catch (err) {
      console.error("Something went wrong while approving ERC20 : ", err);
    } finally {
      setIsLoading(false);
    }
  }

  const payTheRequest = async () => {
    try {
      setIsLoading(true);
      const approved = await checkApproval(request);
      console.log("APPROVAL STATUS: ", approved);

      if (!approved) {
        await approve();
      }

      const _request = await requestNetwork()?.fromRequestId(
        request?.requestId!
      );

      const provider = new providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const paymentTx = await payRequest(request, signer);
      await paymentTx.wait(2);

      toast({
        title: "Transaction submitted",
        description: "The payment is being processed",
      });

      while (request.balance?.balance! < request.expectedAmount) {
        request = await _request?.refresh();
        console.log("REQUEST BALANCE: ", request.balance?.balance);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log("REQUEST AFTER WHILE: ", request);

      setIsPaid(true);
    } catch (err) {
      console.error("Something went wrong while paying : ", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <SheetContent className="w-[700px] max-w-4xl md:max-w-4xl flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <div>Invoice #{request?.contentData?.invoiceNumber}</div>
            <div className="flex items-center gap-4">
              <Badge
                className={cn(
                  "font-light text-sm",
                  checkStatus(request) === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-black"
                )}
              >
                {checkStatus(request)}
              </Badge>
              <ReloadIcon
                onClick={checkInvoice}
                className={cn(
                  "mr-2 h-4 w-4",
                  isLoading ? "animate-spin" : "animate-none"
                )}
              />
            </div>
          </SheetTitle>
        </SheetHeader>
        <div
          className="max-w-3xl mx-auto p-6 bg-white rounded shadow-sm my-6 overflow-auto"
          id="invoice"
        >
          <div className="grid grid-cols-2 items-center">
            <div>
              <img
                src="/quotal.svg"
                alt="company-logo"
                height="100"
                width="100"
              />
            </div>

            <div className="text-right">
              {/* <p>Tailwind Inc.</p>
              <p className="text-gray-500 text-sm">sales@tailwindcss.com</p>
              <p className="text-gray-500 text-sm mt-1">+41-442341232</p>
              <p className="text-gray-500 text-sm mt-1">VAT: 8657671212</p> */}
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mt-8">
            <div>
              <p className="font-bold text-gray-800">From :</p>
              <p className="text-gray-500">{request?.payee?.value}</p>
              <p className="font-bold text-gray-800">Bill to :</p>
              {/* <p className="text-gray-500">
                Laravel LLC.
                <br />
                102, San-Fransico, CA, USA
              </p> */}
              <p className="text-gray-500">{request?.payer?.value}</p>
            </div>

            <div className="text-right">
              <p className="">
                Invoice number:{" "}
                <span className="text-gray-500">
                  #{request?.contentData?.invoiceNumber}
                </span>
              </p>
              <p>
                Invoice date:{" "}
                <span className="text-gray-500">
                  {new Date(
                    request?.contentData?.creationDate
                  ).toLocaleDateString()}
                </span>
                <br />
                Due date:{" "}
                <span className="text-gray-500">
                  {new Date(
                    request?.contentData?.paymentTerms?.dueDate
                  ).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          <div className="-mx-4 mt-8 flow-root sm:mx-0">
            <table className="min-w-full">
              <colgroup>
                <col className="w-full sm:w-1/2" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
              </colgroup>
              <thead className="border-b border-gray-300 text-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* <tr className="border-b border-gray-200">
                  <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                    <div className="font-medium text-gray-900">
                      E-commerce Platform
                    </div>
                    <div className="mt-1 truncate text-gray-500">
                      Laravel based e-commerce platform.
                    </div>
                  </td>
                  <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                    500.0
                  </td>
                  <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                    $100.00
                  </td>
                  <td className="py-5 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-0">
                    $5,000.00
                  </td>
                </tr> */}
                {request?.contentData?.invoiceItems.map(
                  (
                    item: {
                      name: string;
                      quantity: number;
                      unitPrice: string;
                    },
                    index: number
                  ) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                        {item.quantity}
                      </td>
                      <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                        ${weiToEth(item.unitPrice)}
                      </td>
                      <td className="py-5 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-0">
                        ${+item.quantity * weiToEth(item.unitPrice)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-6 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-6 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td className="pl-3 pr-6 pt-6 text-right text-sm text-gray-500 sm:pr-0">
                    $
                    {request?.contentData?.invoiceItems.reduce(
                      (
                        acc: number,
                        item: { quantity: number; unitPrice: string }
                      ) => acc + item.quantity * weiToEth(item.unitPrice),
                      0
                    )}
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Tax
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Tax
                  </th>
                  <td className="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0">
                    $0
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-4 text-right text-sm font-normal text-gray-500 sm:table-cell sm:pl-0"
                  >
                    Discount
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-4 text-left text-sm font-normal text-gray-500 sm:hidden"
                  >
                    Discount
                  </th>
                  <td className="pl-3 pr-6 pt-4 text-right text-sm text-gray-500 sm:pr-0">
                    - 0%
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 sm:table-cell sm:pl-0"
                  >
                    Total
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 sm:hidden"
                  >
                    Total
                  </th>
                  <td className="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900 sm:pr-0">
                    $
                    {request?.contentData?.invoiceItems.reduce(
                      (
                        acc: number,
                        item: { quantity: number; unitPrice: string }
                      ) => acc + item.quantity * weiToEth(item.unitPrice),
                      0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="border-t-2 pt-4 text-xs text-gray-500 text-center mt-16">
            Please pay the invoice before the due date. You can pay the invoice
            by logging in to your account from our client portal.
          </div>
        </div>
        {address === request?.payer?.value && (
          <SheetFooter>
            {!isPaid && (
              <Button
                type="button"
                onClick={payTheRequest}
                disabled={isLoading}
              >
                Pay Invoice
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
