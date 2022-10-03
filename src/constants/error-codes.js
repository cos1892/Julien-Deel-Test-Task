module.exports = {
    'INVALID_JOB_ID': {
        status: 400,
        message: 'Invalid Job Id'
    },
    'JOB_PAID': {
        status: 400,
        message: 'Job already has been paid!'
    },
    'INSUFFICIENT_FUNDS': {
        status: 400,
        message: 'Insufficient funds!'
    },
    'NO_UNPAID_JOBS': {
        status: 400,
        message: 'You are not eligible to make a deposit, because all jobs are paid!'
    },
    'INVALID_DEPOSIT_AMOUNT': {
        status: 400,
        message: 'Deposit amount should be greater than 0 and less than or equal 25% of your unpaid jobs!'
    },
    'INTERNAL_SERVER_ERROR': {
        status: 400, // Return 400 because it's a bad practice to display to user 500 errors
        message: 'Request failed!'
    }
}