# {#nfr} NFT Royalty

NFT Royalty is a command-line and Web-based application that enables three participants (a `seller`, a `buyer` and a 
`broker`) to trade NFTs for royalty tokens via a Reach Decentralized Application (DApp). 
Reach programs are built using a Docker container on your computer. 
This tutorial contains everything you need to know to build and test this application and assumes no prior experience with 
DApp/blockchain development of any kind. If you need help installing Reach and its prerequisites then get started at 
our [Quick Installation Guide](##quickstart).

NFT Royalty creates a payment plan that compensate creators, enabling the seller and buyer to make a transaction, and 
then exits.

# {#nfr-1} Learning Objectives

At the end of this tutorial you will be able to:

1. Install and Initialize
1. Define essential Reach terms.
1. Build a Reach command-line DApp.
1. Convert the command-line DApp into a Web-app.

## {#nfr-2} Install and Initialize

Reach is designed to work on POSIX systems with [make](https://en.wikipedia.org/wiki/Make_(software)), [Docker](https://www.docker.com/get-started), and [Docker Compose](https://docs.docker.com/compose/install/) installed.
The best way to install Docker on Mac and Windows is with [Docker Desktop](https://www.docker.com/products/docker-desktop).

:::note
You probably already have `make` installed.
For example, OS X and many other POSIX systems come with `make`, but some versions of Linux do not include it by default and will require you to install it.
If you're on Ubuntu, you can run `sudo apt install make` to get it.
:::

You'll know that you have everything installed if you can run the following three commands without errors

```cmd
$ make --version
```

```cmd
$ docker --version
```

```cmd
$ docker-compose --version
```

:::note
If you're using Windows, consult [the guide to using Reach on Windows](##guide-windows).
:::

Once you've confirmed that they are installed, choose a directory for this project. We recommend

```cmd
$ mkdir -p ~/reach/nfte && cd ~/reach/nfte
```

Next, download Reach by running

```cmd
$ curl https://docs.reach.sh/reach -o reach ; chmod +x reach
```

You'll know that the download worked if you can run

```cmd
$ ./reach version
```

The recommended next step, although optional, is to set up your environment with

```cmd
$ ./reach config
```

This will make subsequent uses of the `reach` script more convenient by tuning its runtime behavior to your specific needs and only downloading the dependencies you'll actually use.

`{!cmd} reach config` sets overridable defaults for _all_ Reach projects on your development machine and not just the current one, so feel free to skip this step if you'd prefer not to make your choices global.

Since Reach is Dockerized, when you first use it, you'll need to download the images it uses.
Fetch them by running

```cmd
$ ./reach update
```

You'll know that everything is in order if you can run

```cmd
$ ./reach compile --help
```

---

:::note
Get language support for Reach in your editor by visiting @{seclink("guide-editor-support")}.
:::

Now that your Reach installation is in order, you should open a text editor and get ready to [write your first Reach application](##nfr-3)!


# {#nfr-3} Reach Modes

Reach programs (the `index.rsh` portion of your Reach DApp) are organized into four modes: `Init Mode`, `Step Mode`, `Local 
Step Mode`, and `Consensus Step Mode`.

### {#nfr-4} Init Mode

Application Initialization defines participants and views.

Lines 2, 3 and 4 below occur in the App Init section of the program:

``` js
export const main = Reach.App(() => {
  const A = Participant('A', {
    ...Creator,
    id: UInt, // id of NFT
    price: UInt, // price
    tax: UInt, // tax
  });
  const B   = Participant('B', {
    ...Buyer
  });
  const C   = Participant('C', {
    ...Broker
  });
  deploy();
  ```
  
The `{!rsh} init` function transitions the program from `App Init` to `Step`.

### {#nfr-5} Step Mode
A `Step` specifies actions taken by each and every participant. 
`exit()`, for example, is a function that must occur within a step, and it means that each and every participant exits 
the contract after which that instance of the contract becomes forever unavailable.

### {#nfr-6} Local Step Mode
A `Local Step` specifies actions taken by a single participant. 
Local steps must occur within the body of `{!rsh} only` or `{!rsh} each` statements. 
Here is an example:

``` js
A.only(() => {
    const id = declassify(interact.getId());
    const price = declassify(interact.getPrice());
    const tax = declassify(interact.getTax());
  });
  ```
  
`{!rsh} only()` and `{!rsh} each()` transition to a local step and then back to the originating mode (either `Step` or 
`Consensus Step`).

### {#nfr-7} Consensus Step Mode

A `Consensus Step` specifies actions taken by the contract itself. 
Later in this tutorial, the contract calls `{!rsh} transfer` to transfer funds from the contract to the `seller`.

# {#nfr-8} Pre-coding preparation

Before you start to code, it is a good idea to think about the application that you want to create and write down a plan 
for the actions. 
This makes it easier to code the app, add in all of the functionality, and be less likely to make a mistake.

NFT with Royalty requirements:

1. NFT with Royalty requires three participants, a `Buyer`, a `Broker` and a `Seller`.
1. The `buyer` will need a pay function and a function that displays the purchased NFT.
1. The `broker` will need a function to hold the price and the NFT to be released to both seller and buyer.
1. The `seller` will need a function to input the NFT, and to put it up for sale.
1. Participants will be publishing information: the seller will publish the NFT and the price, the buyer 
will publish their decision to purchase, and the broker will release it to bothe the seller and buyer.
1. The `buyer` needs to be able to decide to NOT purchase the wisdom, so we need to create a function for cancelling 
the sale.
1. If the `buyer` does decide to buy the wisdom, then there needs to be a function that reports the payment to both the 
`seller` and the `buyer`.

# {#nfr-9} Examine the transaction

This particular transaction took place on an Algorand devnet. 
The Algorand cryptocurrency standard token unit is the `ALGO`. 
These expenses represent `fees`, the cost of doing business on a consensus network. 
The `seller` paid a little more fees than the `buyer` because the `seller` paid a small fee to deploy the contract.

# {#nfr-10} Create the files
Create a project folder and `{!cmd} cd` into it via the command line.

```cmd
$ mkdir -p ~/reach/nfte && cd ~/reach/nfte
```

Create `index.js` and `index.rsh` in your project folder and open both new files in your preferred editor.

![Open VSCode](/assets/vscode.png)

## {#wfs-11} Create the Frontend

Type the following code into the file named `index.js`.

``` js
load: /examples/wisdom-1-starter/index.js
md5: 77f7503ee58c2459f3793262212ca702
range: 1-8
```

Line 1: 
