//
//  WeatherViewController.swift
//  Clima
//
//  Created by Julien Shim on 4/16/19.
//  Copyright © 2019 Julien Shim. All rights reserved.
//

import UIKit

class WeatherViewController: UIViewController {
    
    let WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
    let APP_ID = "Input label here when you're not lazy."
/***Get your own App ID at https://openweathermap.org/aapid ***/
    
    //TODO: Declare instance variables here
    
    //IBOutlets
    @IBOutlet weak var weatherIcon: UIImageView!
    @IBOutlet weak var cityLabel: UILabel!
    @IBOutlet weak var temperatureLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
             //TODO:Set up the location manager here.
    }
    
    //MARK: - Networking
    /***************************************************************/
    
    //Write the getWeatherData method here:
    
    
    
    
    
    
    
    //MARK: - JSON Parsing
    /***************************************************************/
    
    
    //Write the updateWeatherData method here:
    
    
    
    
    
    //MARK: - UI Updates
    /***************************************************************/
    
    
    //Write the updateUIWithWeatherData method here:
    
    
    
    
    
    
    //MARK: - Location Manager Delegate Methods
    /***************************************************************/
    
    
    //Write the didUpdateLocations method here:
    
    
    
    //Write the didFailWithError method here:
    
    
    
    
    
    //MARK: - Change City Delegate methods
    /***************************************************************/
    
    
    //Write the userEnteredANewCityName Delegate method here:
    
    
    
    //Write the PrepareForSegue Method here


}

