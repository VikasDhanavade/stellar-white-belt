#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, String, Symbol, symbol_short};

// Storage key for feedback counter
const COUNT_FB: Symbol = symbol_short!("COUNT_FB");

#[contracttype]
pub enum FBbook {
    Feedback(u64),
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Feedback {
    pub fb_id: u64,
    pub message: String,
}

#[contract]
pub struct Anonymousfeedback;

#[contractimpl]
impl Anonymousfeedback {

    // SEND FEEDBACK
    pub fn send_feedback(env: Env, feedback_msg: String) -> u64 {

        // get current count
        let mut fb_count: u64 =
            env.storage().instance().get(&COUNT_FB).unwrap_or(0);

        // increment
        fb_count += 1;

        // create feedback struct
        let fb_details = Feedback {
            fb_id: fb_count,
            message: feedback_msg,
        };

        // store feedback
        env.storage().instance().set(&FBbook::Feedback(fb_count), &fb_details);

        // update counter
        env.storage().instance().set(&COUNT_FB, &fb_count);
        env.storage().instance().extend_ttl(5000, 5000);

        // return id
        fb_count
    }
}
