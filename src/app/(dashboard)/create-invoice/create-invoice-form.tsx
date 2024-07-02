"use client";

import ChainedList from "@/components/chained-list";
import { Button, Select, Input as NInput, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import TableForm from "./table-form";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Identity } from "@requestnetwork/request-client.js/dist/types";
import { parseUnits, zeroAddress } from "viem";
import { useAppContext } from "@/context/app-context";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { walletClient } from "@/config/client";
import { useFormik } from "formik";
import { Input } from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";

const networks = [{ key: "sepolia", label: "Sepolia" }];

const currencies = [
  { key: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C", label: "FAU" },
];

const itemSnippet = { item: "", price: "", qty: "" };

const CreateInvoiceForm = () => {
  const { toast } = useToast();
  const { address, getRequests } = useAppContext();
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [totalInvoice, setTotalInvoice] = useState(0);

  const invoiceForm = useFormik({
    initialValues: {
      issuedDate: "",
      dueDate: "",
      client: "",
      recipient: "",
      network: "",
      currency: "",
      items: [itemSnippet],
      memo: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true);
      try {
        console.log("Form values:", values);
        await createInvoice();
        console.log("Invoice created!");
        resetForm();
        toast({
          title: "Invoice created!",
          description: "Your invoice has been created successfully.",
        });
      } catch (error) {
      } finally {
        setSubmitting(false);
      }
    },
  });

  const addItem = () => {
    invoiceForm.setFieldValue("items", [
      ...invoiceForm.values.items,
      itemSnippet,
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = invoiceForm.values.items.filter((_, i) => i !== index);
    invoiceForm.setFieldValue("items", newItems);
  };

  useEffect(() => {
    const total = invoiceForm.values.items.reduce(
      (acc, item) => acc + (+item.price || 0) * (+item.qty || 0),
      0
    );
    setTotalInvoice(total);
  });

  useEffect(() => {
    (async () => {
      try {
        const requests = await getRequests();
        setInvoiceId(requests ? requests.length.toString() : "0");
      } catch (error) {
        console.error("Failed to get invoices:", error);
      }
    })();
  }, [address]);

  const createInvoice = async () => {
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);

    const requestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://sepolia.gateway.request.network",
      },
      signatureProvider: web3SignatureProvider,
    });

    if (requestNetwork && address) {
      try {
        // addToStatus(APP_STATUS.PERSISTING_TO_IPFS);
        const request = await requestNetwork.createRequest({
          requestInfo: {
            currency: {
              type: "ERC20" as Types.RequestLogic.CURRENCY,
              value: invoiceForm.values.currency,
              network: "sepolia",
            },
            expectedAmount: parseUnits(totalInvoice.toString(), 18).toString(),
            payee: {
              type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
              value: invoiceForm.values.recipient,
            },
            payer: {
              type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
              value: invoiceForm.values.client,
            },
            timestamp: Utils.getCurrentTimestampInSecond(),
          },
          paymentNetwork: {
            id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
            parameters: {
              paymentNetworkName: "sepolia",
              paymentAddress: address,
              feeAddress: zeroAddress,
              feeAmount: "0",
            },
          },
          contentData: {
            paymentTerms: {
              dueDate: new Date(invoiceForm.values.dueDate).toISOString(),
            },
            creationDate: new Date(invoiceForm.values.issuedDate).toISOString(),
            invoiceNumber: invoiceId,
            invoiceItems: invoiceForm.values.items.map((item) => ({
              name: item.item,
              quantity: Number(item.qty),
              unitPrice: parseUnits(item.price, 18).toString(),
              discount: "0",
              tax: {
                type: "percentage",
                amount: "0",
              },
              currency: invoiceForm.values.currency,
            })),
          },
          signer: {
            type: "ethereumAddress",
            value: address,
          } as Identity.IIdentity,
        });
        // addToStatus(APP_STATUS.PERSISTING_ON_CHAIN);
        await request.waitForConfirmation();
        // addToStatus(APP_STATUS.REQUEST_CONFIRMED);
        console.log("Request created:", request);
      } catch (error) {
        // addToStatus(APP_STATUS.ERROR_OCCURRED);
        console.error("Failed to create request:", error);
      }
    }
  };

  return (
    <form
      className="grid grid-cols-5 gap-4 w-[95%] mx-auto"
      onSubmit={invoiceForm.handleSubmit}
    >
      <div className="bg-white border col-span-3 py-10 px-6 pb-4 mb-10">
        <h2 className="text-2xl font-medium">
          Invoice {invoiceId && "#" + invoiceId}
        </h2>
        <div className="flex flex-col gap-7 mt-8">
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <div className="w-full">
              <label htmlFor="" className="block">
                Issued Date
              </label>
              <DatePicker
                placeholder="Invoice date"
                date={
                  invoiceForm.values.issuedDate
                    ? new Date(invoiceForm.values.issuedDate)
                    : undefined
                }
                setDate={(date) =>
                  invoiceForm.setFieldValue("issuedDate", date)
                }
              />
            </div>
            <div className="w-full">
              <label htmlFor="" className="block">
                Due Date
              </label>
              <DatePicker
                placeholder="Due date"
                date={
                  invoiceForm.values.dueDate
                    ? new Date(invoiceForm.values.dueDate)
                    : undefined
                }
                setDate={(date) => invoiceForm.setFieldValue("dueDate", date)}
              />
            </div>
          </div>
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <NInput
              type="text"
              label="Client"
              placeholder="Enter client address"
              {...invoiceForm.getFieldProps("client")}
            />
            <NInput
              type="text"
              label="Recipeint"
              placeholder="Enter receiver's address"
              endContent={
                <button
                  type="button"
                  className="text-xs"
                  onClick={() =>
                    invoiceForm.setFieldValue("recipient", address)
                  }
                >
                  Use my address
                </button>
              }
              {...invoiceForm.getFieldProps("recipient")}
            />
          </div>
          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select
              label="Select Network"
              placeholder="Choose payment network"
              className="max-w-xs"
              value={invoiceForm.values.network}
              onChange={(e) =>
                invoiceForm.setFieldValue("network", e.target.value)
              }
            >
              {networks.map((network) => (
                <SelectItem key={network.key}>{network.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Select Currency"
              placeholder="Choose payment currency"
              className="max-w-xs"
              value={invoiceForm.values.currency}
              onChange={(e) =>
                invoiceForm.setFieldValue("currency", e.target.value)
              }
            >
              {currencies.map((currency) => (
                <SelectItem key={currency.key}>{currency.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <div className="md:flex items-center">
              <div className="flex flex-col md:w-5/12">
                <Label value="Item" />
              </div>
              <div className="flex flex-col md:w-2/12 md:ml-2 md:mt-0 mt-8">
                <Label value="Price($)" />
              </div>
              <div className="flex flex-col md:w-2/12 md:ml-2 md:mt-0 mt-8">
                <Label value="Qty" />
              </div>
              <div className="flex flex-col md:w-2/12 md:ml-2 md:mt-0 mt-8">
                <Label value="Total Price($)" />
              </div>
            </div>
            <div className="space-y-2">
              {invoiceForm.values.items.map((item, index) => (
                <div key={index} className="md:flex items-center">
                  <div className="flex flex-col md:w-5/12">
                    <Input
                      type="text"
                      tabIndex={0}
                      placeholder="Enter item description"
                      {...invoiceForm.getFieldProps(`items[${index}].item`)}
                    />
                  </div>
                  <div className="flex flex-col md:w-2/12 md:ml-2">
                    <Input
                      type="text"
                      tabIndex={0}
                      placeholder="$500"
                      {...invoiceForm.getFieldProps(`items[${index}].price`)}
                    />
                  </div>
                  <div className="flex flex-col md:w-2/12 md:ml-2">
                    <Input
                      type="text"
                      tabIndex={0}
                      placeholder="1"
                      {...invoiceForm.getFieldProps(`items[${index}].qty`)}
                    />
                  </div>
                  <div className="flex flex-col md:w-2/12 md:ml-2 text-center">
                    {(Number(invoiceForm.values.items[index].qty) || 0) *
                      (Number(invoiceForm.values.items[index].price) || 0)}
                  </div>
                  {invoiceForm.values.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 border border-red-500 rounded-full w-6 h-6 flex items-center justify-center ml-2 bg-transparent hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={addItem}
              color="primary"
              radius="sm"
              className="flex items-center mt-4"
            >
              <span className="mr-2">+</span> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-10">
            <Textarea
              placeholder="Enter your memo here"
              className="col-span-3"
              rows={5}
              {...invoiceForm.getFieldProps("memo")}
            />
            <div className="col-span-2">
              <h2 className="font-semibold text-sm">Attached Files</h2>
              <span className="text-gray-500 text-sm">
                No file attached yet.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border col-span-2 py-10 px-6 pb-4 h-fit sticky top-0">
        <h2 className="text-2xl font-medium">
          Invoice {invoiceId && "#" + invoiceId}
        </h2>
        <div className="mt-8">
          <ChainedList title="Your credentials" value={`${address}`} />
          <ChainedList
            isAddress
            title="Billed to"
            value={invoiceForm.values.client}
          />
          <ChainedList
            title="Invoice Currency"
            value={
              invoiceForm.values.currency ===
              "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C"
                ? "FAU"
                : ""
            }
          />
          <ChainedList title="Invoice Type" value="Regular Invoice" />
          <ChainedList
            isAddress
            title="Receive Payment"
            value={invoiceForm.values.recipient}
          />
          <ChainedList
            title="Amount Details"
            value={
              totalInvoice > 0
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalInvoice)
                : ""
            }
          />
          <ChainedList
            title="Memo & Attachments (Optional)"
            value={invoiceForm.values.memo ? "You have added a memo" : ""}
            isLast
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button color="default" radius="sm">
            Save as Draft
          </Button>
          <Button
            color="primary"
            radius="sm"
            type="submit"
            disabled={invoiceForm.isSubmitting}
          >
            {invoiceForm.isSubmitting && (
              <ReloadIcon className="animate-spin w-6 h-6 ml-2" />
            )}
            Create Invoice
          </Button>
        </div>
      </div>
    </form>
  );
};

const Label = ({ value }: { value: string }) => (
  <label className="mb-3 text-sm leading-none text-gray-800">{value}</label>
);

export default CreateInvoiceForm;
